export function createPaidGigSubscriptionRequirementService({ userRepository } = {}) {
  if (!userRepository?.setPaidGigSubscriptionRequired) {
    throw new Error("Paid-gig subscription requirement handling needs the User repository contract.");
  }

  return {
    /**
     * C05 handoff for Student 3's first accepted Paid-gig event only.
     * This must not be called for applications, browsing, uploads, or rejection.
     */
    async markRequiredAfterFirstAcceptedPaidGig(talentId) {
      if (!talentId) throw new Error("A talent identity is required.");

      return userRepository.setPaidGigSubscriptionRequired({ talentId });
    },
  };
}
