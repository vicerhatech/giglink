import { Router } from "express";
import {
  cancelGig,
  createGig,
  getGigById,
  getMyGigs,
  updateGig,
} from "./gig.controller.js";

function authorizationError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/**
 * Requires the JWT middleware owned by Student 1 to populate request.user
 * before this feature router is mounted by the Captain.
 */
export function requireCustomer(request, _response, next) {
  if (!request.user) {
    next(authorizationError("Authentication is required.", 401));
    return;
  }

  if (request.user.role !== "customer") {
    next(authorizationError("Customer access is required.", 403));
    return;
  }

  next();
}

export function createCustomerGigRouter({ authenticate } = {}) {
  const router = Router();

  if (authenticate) {
    router.use(authenticate);
  }

  router.use(requireCustomer);
  router.post("/", createGig);
  router.get("/customer/mine", getMyGigs);
  router.get("/customer/:id", getGigById);
  router.patch("/:id", updateGig);
  router.delete("/:id", cancelGig);

  return router;
}

export const customerGigRouter = createCustomerGigRouter();
