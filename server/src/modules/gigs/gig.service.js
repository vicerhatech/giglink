import { gigRepository } from "./gig.repository.js";
import { validateGigDraft } from "./gig.validation.js";

const EDITABLE_FIELDS = new Set([
  "title",
  "eventType",
  "description",
  "eventDate",
  "eventTime",
  "location",
  "applicationDeadline",
  "gigType",
  "paymentRange",
  "positions",
]);

const SYSTEM_CONTROLLED_FIELDS = new Set([
  "_id",
  "id",
  "__v",
  "customerId",
  "postingFee",
  "postingPaymentStatus",
  "publicationStatus",
  "postingPaymentReference",
  "postingPaymentDetails",
  "paymentReference",
  "paymentDetails",
  "createdAt",
  "updatedAt",
]);

function serviceError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function ensureEditablePayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw serviceError("Update payload must be an object.");
  }

  const fields = Object.keys(payload);
  const systemField = fields.find((field) => SYSTEM_CONTROLLED_FIELDS.has(field));
  if (systemField) {
    throw serviceError(`${systemField} is system-controlled and cannot be updated by a customer.`);
  }

  const unknownField = fields.find((field) => !EDITABLE_FIELDS.has(field));
  if (unknownField) {
    throw serviceError(`${unknownField} cannot be updated.`);
  }

  if (fields.length === 0) {
    throw serviceError("Provide at least one editable gig field.");
  }
}

function toValidationPayload(gig, changes) {
  const value = (field) => (Object.hasOwn(changes, field) ? changes[field] : gig[field]);

  return {
    title: value("title"),
    eventType: value("eventType"),
    description: value("description"),
    eventDate: value("eventDate"),
    eventTime: value("eventTime"),
    location: value("location"),
    applicationDeadline: value("applicationDeadline"),
    gigType: value("gigType"),
    paymentRange: value("paymentRange"),
    positions: value("positions"),
  };
}

/** Creates a payment-unverified draft; publication is owned by the payment flow. */
export async function createGigDraft(customerId, payload, repository = gigRepository) {
  const draft = validateGigDraft(payload);

  return repository.create({
    ...draft,
    customerId,
    postingPaymentStatus: "unpaid",
    publicationStatus: "draft",
  });
}

export async function listCustomerGigs(customerId, repository = gigRepository) {
  return repository.findByCustomer(customerId);
}

export async function getCustomerGig(customerId, gigId, repository = gigRepository) {
  const gig = await repository.findOwnedById(gigId, customerId);
  if (!gig) {
    throw serviceError("Gig not found.", 404);
  }
  return gig;
}

export async function updateCustomerGig(customerId, gigId, changes, repository = gigRepository) {
  ensureEditablePayload(changes);
  const gig = await getCustomerGig(customerId, gigId, repository);
  const validated = validateGigDraft(toValidationPayload(gig, changes));

  for (const field of EDITABLE_FIELDS) {
    if (Object.hasOwn(changes, field)) {
      gig.set(field, validated[field]);
    }
  }

  if (Object.hasOwn(changes, "gigType") || Object.hasOwn(changes, "paymentRange")) {
    gig.set("gigType", validated.gigType);
    gig.set("paymentRange", validated.paymentRange);
    gig.set("postingFee", validated.postingFee);
  }

  await gig.save();
  return gig;
}

/**
 * DELETE is a cancellation operation so payment/audit records retain their gig reference.
 * It does not initiate a refund or alter payment state.
 */
export async function cancelCustomerGig(customerId, gigId, repository = gigRepository) {
  const gig = await getCustomerGig(customerId, gigId, repository);

  if (gig.publicationStatus === "completed") {
    throw serviceError("Completed gigs cannot be cancelled.");
  }

  gig.set("publicationStatus", "cancelled");
  await gig.save();
  return gig;
}
