const SAFE_GIG_FIELDS = "_id customerId title eventType eventDate gigType paymentRange postingFee postingPaymentStatus publicationStatus createdAt updatedAt";

/** Adapter for Student 2's Gig model, wired during C05. */
export function createMongooseGigRepository({ Gig } = {}) {
  if (!Gig?.find) throw new Error("Admin gig oversight needs the Student 2 Gig model.");

  return {
    async listGigs() {
      return Gig.find({}).select(SAFE_GIG_FIELDS).sort({ createdAt: -1 }).lean();
    },
  };
}

export function createAdminGigService({ gigRepository } = {}) {
  if (!gigRepository?.listGigs) throw new Error("Admin gig oversight needs the Gig repository adapter.");

  return {
    listGigs() {
      return gigRepository.listGigs();
    },
  };
}
