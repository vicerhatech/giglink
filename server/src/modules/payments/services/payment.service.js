import { Payment } from "../models/payment.model.js";
import { getExpectedPaymentAmount } from "./payment-policy.service.js";

export {
  FREE_GIG_POSTING_FEE,
  PAID_GIG_POSTING_FEE,
  TALENT_SUBSCRIPTION_FEE,
  getExpectedPaymentAmount,
} from "./payment-policy.service.js";

export async function createInitializedPayment({
  userId,
  gigId = null,
  purpose,
  gigType,
  reference,
} = {}) {
  if (!userId || !reference) {
    throw new Error("A user and payment reference are required.");
  }

  const amount = getExpectedPaymentAmount({ purpose, gigType });

  return Payment.create({
    userId,
    gigId,
    purpose,
    amount,
    reference,
    status: "initialized",
  });
}

export async function markPaymentSuccessful(reference, paidAt = new Date()) {
  if (!reference) {
    throw new Error("A payment reference is required.");
  }

  return Payment.findOneAndUpdate(
    { reference },
    { $set: { status: "successful", paidAt } },
    { new: true },
  );
}

export async function markPaymentFailed(reference) {
  if (!reference) {
    throw new Error("A payment reference is required.");
  }

  return Payment.findOneAndUpdate(
    { reference, status: "initialized" },
    { $set: { status: "failed" } },
    { new: true },
  );
}
