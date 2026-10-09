import { randomUUID } from "node:crypto";
import { Payment } from "../models/payment.model.js";
import { getExpectedPaymentAmount } from "./payment-policy.service.js";
import { PAYSTACK_CURRENCY, nairaToKobo } from "./paystack.client.js";

export class GigPostingPaymentError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "GigPostingPaymentError";
    this.statusCode = statusCode;
  }
}

function idsMatch(left, right) {
  return left && right && String(left) === String(right);
}

function getPostingPurpose(gigType) {
  if (gigType === "free") return "free_gig_post";
  if (gigType === "paid") return "paid_gig_post";
  throw new GigPostingPaymentError("Gig type is invalid for a posting payment.");
}

function assertEligibleGig(gig, customerId) {
  if (!gig || !idsMatch(gig.customerId, customerId)) {
    throw new GigPostingPaymentError("Gig not found.", 404);
  }

  if (gig.publicationStatus !== "draft" || gig.postingPaymentStatus !== "unpaid") {
    throw new GigPostingPaymentError("Only unpaid draft gigs can be paid for.", 409);
  }
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

/**
 * Gig repository contract, implemented by Student 2 during integration:
 * - findCustomerOwnedGig({ gigId, customerId })
 * - markPostingPaymentVerified({ gigId, customerId, paymentReference })
 *
 * The second method must safely update only that customer's unpaid draft gig to
 * postingPaymentStatus="paid" and publicationStatus="published", and return it.
 */
export function createGigPostingPaymentService({
  gigRepository,
  paystackClient,
  paymentRepository = Payment,
  generateReference = () => `gigpost_${randomUUID()}`,
  callbackUrl = process.env.CLIENT_URL
    ? `${process.env.CLIENT_URL.replace(/\/$/, "")}/payments/gig-post/callback`
    : undefined,
} = {}) {
  if (!gigRepository?.findCustomerOwnedGig || !gigRepository?.markPostingPaymentVerified) {
    throw new Error("Gig posting payments require the Gig repository integration contract.");
  }

  if (!paystackClient?.initializeTransaction || !paystackClient?.verifyTransaction) {
    throw new Error("Gig posting payments require a Paystack client.");
  }

  async function getOwnedGig(gigId, customerId) {
    const gig = await gigRepository.findCustomerOwnedGig({ gigId, customerId });
    if (!gig || !idsMatch(gig.customerId, customerId)) {
      throw new GigPostingPaymentError("Gig not found.", 404);
    }

    return gig;
  }

  async function publishVerifiedGig(payment) {
    const publishedGig = await gigRepository.markPostingPaymentVerified({
      gigId: payment.gigId,
      customerId: payment.userId,
      paymentReference: payment.reference,
    });

    if (!publishedGig) {
      throw new GigPostingPaymentError("Gig could not be published after payment verification.", 409);
    }

    return publishedGig;
  }

  return {
    async initialize({ gigId, customerId, customerEmail }) {
      if (!gigId || !customerId || !customerEmail) {
        throw new GigPostingPaymentError("Gig, customer identity, and customer email are required.");
      }

      const gig = await getOwnedGig(gigId, customerId);
      assertEligibleGig(gig, customerId);

      const purpose = getPostingPurpose(gig.gigType);
      const amount = getExpectedPaymentAmount({ purpose, gigType: gig.gigType });
      const existingInitializedPayment = await paymentRepository.findOne({
        userId: customerId,
        gigId: gig._id || gigId,
        purpose,
        status: "initialized",
      });

      if (existingInitializedPayment) {
        throw new GigPostingPaymentError("A posting payment is already awaiting completion for this gig.", 409);
      }

      const reference = generateReference();
      const payment = await paymentRepository.create({
        userId: customerId,
        gigId: gig._id || gigId,
        purpose,
        amount,
        reference,
        status: "initialized",
      });

      let checkout;
      try {
        checkout = await paystackClient.initializeTransaction({
          email: customerEmail,
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

    async verify({ reference, customerId }) {
      if (!reference || !customerId) {
        throw new GigPostingPaymentError("Payment reference and customer identity are required.");
      }

      const payment = await paymentRepository.findOne({ reference, userId: customerId });
      if (!payment || !["free_gig_post", "paid_gig_post"].includes(payment.purpose)) {
        throw new GigPostingPaymentError("Payment not found.", 404);
      }

      if (payment.status === "successful") {
        const currentGig = await getOwnedGig(payment.gigId, customerId);
        if (
          currentGig.postingPaymentStatus === "paid"
          && currentGig.publicationStatus === "published"
        ) {
          return { payment: publicPayment(payment), publicationStatus: currentGig.publicationStatus };
        }

        const gig = await publishVerifiedGig(payment);
        return { payment: publicPayment(payment), publicationStatus: gig.publicationStatus };
      }

      const gig = await getOwnedGig(payment.gigId, customerId);
      const expectedPurpose = getPostingPurpose(gig.gigType);
      const expectedAmount = getExpectedPaymentAmount({ purpose: expectedPurpose, gigType: gig.gigType });

      if (payment.purpose !== expectedPurpose || payment.amount !== expectedAmount) {
        throw new GigPostingPaymentError("Payment does not match the gig posting fee.", 409);
      }

      const transaction = await paystackClient.verifyTransaction(reference);
      const transactionSucceeded = transaction.status === "success";
      const matchesPayment = transaction.reference === payment.reference
        && Number(transaction.amount) === nairaToKobo(payment.amount)
        && String(transaction.currency).toUpperCase() === PAYSTACK_CURRENCY;

      if (!transactionSucceeded || !matchesPayment) {
        const failedPayment = await paymentRepository.findOneAndUpdate(
          { reference, userId: customerId, status: "initialized" },
          { $set: { status: "failed" } },
          { new: true },
        );

        return {
          payment: publicPayment(failedPayment || payment),
          publicationStatus: gig.publicationStatus,
        };
      }

      const successfulPayment = await paymentRepository.findOneAndUpdate(
        { reference, userId: customerId },
        { $set: { status: "successful", paidAt: new Date() } },
        { new: true },
      );
      const publishedGig = await publishVerifiedGig(successfulPayment || payment);

      return {
        payment: publicPayment(successfulPayment || payment),
        publicationStatus: publishedGig.publicationStatus,
      };
    },
  };
}
