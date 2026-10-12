export const FREE_GIG_POSTING_FEE = 5000;
export const PAID_GIG_POSTING_FEE = 10000;
export const TALENT_SUBSCRIPTION_FEE = 5000;

export function getExpectedPaymentAmount({ purpose, gigType } = {}) {
  if (purpose === "free_gig_post") {
    if (gigType !== "free") {
      throw new Error("Free gig posting payments require a free gig.");
    }

    return FREE_GIG_POSTING_FEE;
  }

  if (purpose === "paid_gig_post") {
    if (gigType !== "paid") {
      throw new Error("Paid gig posting payments require a paid gig.");
    }

    return PAID_GIG_POSTING_FEE;
  }

  if (purpose === "talent_subscription") {
    return TALENT_SUBSCRIPTION_FEE;
  }

  throw new Error("Unsupported payment purpose.");
}
