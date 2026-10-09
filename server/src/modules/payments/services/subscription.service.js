import { Subscription, SUBSCRIPTION_AMOUNT } from "../models/subscription.model.js";

export const SUBSCRIPTION_DURATION_DAYS = 30;

function addSubscriptionDuration(startsAt) {
  const expiresAt = new Date(startsAt);
  expiresAt.setDate(expiresAt.getDate() + SUBSCRIPTION_DURATION_DAYS);
  return expiresAt;
}

export async function hasActiveTalentSubscription(talentUserId, now = new Date()) {
  if (!talentUserId) {
    return false;
  }

  const activeSubscription = await Subscription.findOne({
    talentId: talentUserId,
    status: "active",
    startsAt: { $lte: now },
    expiresAt: { $gt: now },
  }).select("_id");

  return Boolean(activeSubscription);
}

export async function createOrRenewTalentSubscription({
  talentUserId,
  paymentReference,
  verifiedAt = new Date(),
} = {}) {
  if (!talentUserId || !paymentReference) {
    throw new Error("A talent and verified payment reference are required.");
  }

  const existingSubscription = await Subscription.findOne({ paymentReference });
  if (existingSubscription) {
    return existingSubscription;
  }

  await Subscription.updateMany(
    {
      talentId: talentUserId,
      status: "active",
      expiresAt: { $lte: verifiedAt },
    },
    { $set: { status: "expired" } },
  );

  return Subscription.create({
    talentId: talentUserId,
    amount: SUBSCRIPTION_AMOUNT,
    paymentReference,
    status: "active",
    startsAt: verifiedAt,
    expiresAt: addSubscriptionDuration(verifiedAt),
  });
}
