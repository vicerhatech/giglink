import { Gig } from "./gig.model.js";
import { validateGigDraft } from "./gig.validation.js";

/** Creates a payment-unverified draft; publication is owned by the payment flow. */
export async function createGigDraft(customerId, payload) {
  const draft = validateGigDraft(payload);

  return Gig.create({
    ...draft,
    customerId,
    postingPaymentStatus: "unpaid",
    publicationStatus: "draft",
  });
}
