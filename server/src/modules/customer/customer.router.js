import { Router } from "express";
import { requireCustomer } from "../gigs/gig.router.js";
import { getGigApplication, listGigApplications, updateApplicationStatus } from "./customer.controller.js";

/** Exported only; Captain mounts it with Student 1's authenticate middleware. */
export function createCustomerReviewRouter({ authenticate } = {}) {
  const router = Router();
  if (authenticate) router.use(authenticate);
  router.use(requireCustomer);
  router.get("/gigs/:gigId/applications", listGigApplications);
  router.get("/gigs/:gigId/applications/:applicationId", getGigApplication);
  router.patch("/applications/:applicationId/status", updateApplicationStatus);
  return router;
}

export const customerReviewRouter = createCustomerReviewRouter();
