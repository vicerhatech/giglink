import { randomUUID } from "node:crypto";
import { Payment } from "../models/payment.model.js";
import { getExpectedPaymentAmount } from "./payment-policy.service.js";
import { PAYSTACK_CURRENCY, nairaToKobo } from "./paystack.client.js";
import {
  createOrRenewTalentSubscription,
  hasActiveTalentSubscription,
} from "./subscription.service.js";

export class TalentSubscriptionPaymentError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "TalentSubscriptionPaymentError";
    this.statusCode = statusCode;
  }
}

export function canBrowsePaidGigs({ paidGigSubscriptionRequired, hasActiveSubscription }) {
  return !paidGigSubscriptionRequired || hasActiveSubscription;
}

function publicPayment(payment) {
  return {
    reference: payment.reference,
    purpose: payment.purpose,
    amount: payment.amount,
    status: payment.status,
    paidAt: payment.paidAt || null,
  };
}

function publicSubscription(subscription) {
  if (!subscription) return null;

  return {
    amount: subscription.amount,
    status: subscription.status,
    startsAt: subscription.startsAt,
    expiresAt: subscription.expiresAt,
  };
}

/**
 * User repository contract for C05 integration:
 * - findTalentById({ talentId }) -> active authenticated User with role, email,
 *   and paidGigSubscriptionRequired fields.
 * Subscription repository contract:
 * - findLatestByTalentId({ talentId }) -> most recent Subscription or null.
 */
export function createTalentSubscriptionPaymentService({
  userRepository,
  paystackClient,
  paymentRepository = Payment,
  subscriptionRepository,
  renewSubscription = createOrRenewTalentSubscription,
  hasActiveSubscription = hasActiveTalentSubscription,
  generateReference = () => `talentsub_${randomUUID()}`,
  callbackUrl = process.env.CLIENT_URL
    ? `${process.env.CLIENT_URL.replace(/\/$/, "")}/payments/subscription/callback`
    : undefined,
} = {}) {
  if (!userRepository?.findTalentById) {
    throw new Error("Talent subscription payments require the User repository contract.");
  }

  if (!paystackClient?.initializeTransaction || !paystackClient?.verifyTransaction) {
    throw new Error("Talent subscription payments require a Paystack client.");
  }

  if (!subscriptionRepository?.findLatestByTalentId) {
    throw new Error("Talent subscription payments require the Subscription repository contract.");
  }

  async function getTalentAccount(talentId) {
    const talent = await userRepository.findTalentById({ talentId });
    if (!talent || talent.role !== "talent") {
      throw new TalentSubscriptionPaymentError("Talent account not found.", 404);
    }

    return talent;
  }

  async function getEligibleTalent(talentId) {
    const talent = await getTalentAccount(talentId);

    if (!talent.paidGigSubscriptionRequired) {
      throw new TalentSubscriptionPaymentError(
        "A subscription is only available after your first accepted Paid gig.",
        409,
      );
    }

    return talent;
  }

  async function getSubscriptionStatus(talentId, talent = null) {
    const resolvedTalent = talent || await getTalentAccount(talentId);
    const active = await hasActiveSubscription(talentId);
    const subscription = await subscriptionRepository.findLatestByTalentId({ talentId });

    return {
      paidGigSubscriptionRequired: Boolean(resolvedTalent.paidGigSubscriptionRequired),
      hasActiveSubscription: active,
      paidGigDiscoveryAllowed: canBrowsePaidGigs({
        paidGigSubscriptionRequired: resolvedTalent.paidGigSubscriptionRequired,
        hasActiveSubscription: active,
      }),
      subscription: publicSubscription(subscription),
    };
  }

  return {
    async initialize({ talentId }) {
      if (!talentId) throw new TalentSubscriptionPaymentError("Talent identity is required.", 401);

      const talent = await getEligibleTalent(talentId);
      const amount = getExpectedPaymentAmount({ purpose: "talent_subscription" });
      const existingInitializedPayment = await paymentRepository.findOne({
        userId: talentId,
        purpose: "talent_subscription",
        status: "initialized",
      });

      if (existingInitializedPayment) {
        throw new TalentSubscriptionPaymentError("A subscription payment is already awaiting completion.", 409);
      }

      const reference = generateReference();
      const payment = await paymentRepository.create({
        userId: talentId,
        gigId: null,
        purpose: "talent_subscription",
        amount,
        reference,
        status: "initialized",
      });

      let checkout;
      try {
        checkout = await paystackClient.initializeTransaction({
          email: talent.email,
          amountInKobo: nairaToKobo(amount),
          reference,
          callbackUrl,
        });
      } catch (error) {
        await paymentRepository.findOneAndUpdate(
          { reference, status: "initialized" },
          { $set: { status: "failed" } },
          { new: true },
        );
        throw error;
      }

      return {
        payment: publicPayment(payment),
        authorizationUrl: checkout.authorization_url,
        accessCode: checkout.access_code,
      };
    },

    async verify({ reference, talentId }) {
      if (!reference || !talentId) {
        throw new TalentSubscriptionPaymentError("Payment reference and talent identity are required.", 401);
      }

      const talent = await getEligibleTalent(talentId);
      const payment = await paymentRepository.findOne({
        reference,
        userId: talentId,
        purpose: "talent_subscription",
      });
      if (!payment) throw new TalentSubscriptionPaymentError("Payment not found.", 404);

      if (payment.status === "successful") {
        const subscription = await renewSubscription({
          talentUserId: talentId,
          paymentReference: payment.reference,
          verifiedAt: payment.paidAt || new Date(),
        });
        return {
          payment: publicPayment(payment),
          subscription: publicSubscription(subscription),
          access: await getSubscriptionStatus(talentId, talent),
        };
      }

      const expectedAmount = getExpectedPaymentAmount({ purpose: "talent_subscription" });
      if (payment.amount !== expectedAmount) {
        throw new TalentSubscriptionPaymentError("Payment does not match the subscription fee.", 409);
      }

      const transaction = await paystackClient.verifyTransaction(reference);
      const matchesPayment = transaction.status === "success"
        && transaction.reference === payment.reference
        && Number(transaction.amount) === nairaToKobo(expectedAmount)
        && String(transaction.currency).toUpperCase() === PAYSTACK_CURRENCY;

      if (!matchesPayment) {
        const failedPayment = await paymentRepository.findOneAndUpdate(
          { reference, userId: talentId, status: "initialized" },
          { $set: { status: "failed" } },
          { new: true },
        );

        return {
          payment: publicPayment(failedPayment || payment),
          subscription: null,
          access: await getSubscriptionStatus(talentId, talent),
        };
      }

      const paidAt = new Date();
      const successfulPayment = await paymentRepository.findOneAndUpdate(
        { reference, userId: talentId },
        { $set: { status: "successful", paidAt } },
        { new: true },
      );
      const confirmedPayment = successfulPayment || payment;
      const subscription = await renewSubscription({
        talentUserId: talentId,
        paymentReference: confirmedPayment.reference,
        verifiedAt: confirmedPayment.paidAt || paidAt,
      });

      return {
        payment: publicPayment(confirmedPayment),
        subscription: publicSubscription(subscription),
        access: await getSubscriptionStatus(talentId, talent),
      };
    },

    async getStatus({ talentId }) {
      if (!talentId) throw new TalentSubscriptionPaymentError("Talent identity is required.", 401);
      return getSubscriptionStatus(talentId);
    },
  };
}
