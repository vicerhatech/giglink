import { Gig } from "./gig.model.js";

export function createGigRepository(model = Gig) {
  return {
    create: (draft) => model.create(draft),
    findByCustomer: (customerId) => model.find({ customerId }).sort({ createdAt: -1 }),
    findOwnedById: (gigId, customerId) => model.findOne({ _id: gigId, customerId }),
  };
}

export const gigRepository = createGigRepository();
