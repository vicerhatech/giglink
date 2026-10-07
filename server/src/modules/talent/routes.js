import { Router } from "express";
import { getProfile, updateProfile } from "./talentProfile.controller.js";
import { createTalentDiscoveryController } from "./talentDiscovery.controller.js";
import { createTalentDiscoveryService } from "./talentDiscovery.service.js";
import { createApplicationController } from "../applications/application.controller.js";

// Captain supplies the shared JWT middleware during application integration.
// The controller also verifies request.user.role as a defence-in-depth check.
export function createTalentProfileRouter(authenticate) {
  if (typeof authenticate !== "function") {
    throw new TypeError("createTalentProfileRouter requires the shared authenticate middleware.");
  }

  const router = Router();
  router.get("/profile", authenticate, getProfile);
  router.put("/profile", authenticate, updateProfile);
  return router;
}

// Gig and subscription persistence remain owned by Student 2 and the Captain.
// They are supplied during application integration instead of being duplicated here.
export function createTalentRouter({
  authenticate,
  gigRepository,
  hasActiveTalentSubscription,
  hasAcceptedApplication,
  applicationService,
}) {
  const router = createTalentProfileRouter(authenticate);
  const discoveryService = createTalentDiscoveryService({
    gigRepository,
    hasActiveTalentSubscription,
    hasAcceptedApplication,
  });
  const discoveryController = createTalentDiscoveryController(discoveryService);

  router.get("/gigs", authenticate, discoveryController.listGigs);
  router.get("/gigs/:id", authenticate, discoveryController.getGig);
  if (applicationService) {
    const applicationController = createApplicationController(applicationService);
    router.post("/gigs/:gigId/positions/:positionId/apply", authenticate, applicationController.submit);
    router.get("/applications", authenticate, applicationController.listMine);
    router.patch("/applications/:id/withdraw", authenticate, applicationController.withdraw);
  }
  return router;
}
