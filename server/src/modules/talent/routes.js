import { Router } from "express";
import multer from "multer";
import { getProfile, updateProfile, createProfilePhotoController } from "./talentProfile.controller.js";
import { createMediaService } from "../media/media.service.js";
import { createTalentDiscoveryController } from "./talentDiscovery.controller.js";
import { createTalentDiscoveryService } from "./talentDiscovery.service.js";
import { createApplicationController } from "../applications/application.controller.js";

export const MAX_PROFILE_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;

const profilePhotoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PROFILE_PHOTO_SIZE_BYTES, files: 1 },
  fileFilter: (_request, file, callback) => {
    if (["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) return callback(null, true);
    const error = new Error("Only JPEG, PNG, or WebP images can be uploaded.");
    error.statusCode = 400;
    return callback(error);
  },
});

function uploadSingleProfilePhoto(request, response, next) {
  profilePhotoUpload.single("image")(request, response, (error) => {
    if (error?.code === "LIMIT_FILE_SIZE") {
      error.message = "Profile images must be 5 MB or smaller.";
      error.statusCode = 413;
    }
    next(error);
  });
}

// Captain supplies the shared JWT middleware during application integration.
// The controller also verifies request.user.role as a defence-in-depth check.
export function createTalentProfileRouter(authenticate, mediaService = createMediaService()) {
  if (typeof authenticate !== "function") {
    throw new TypeError("createTalentProfileRouter requires the shared authenticate middleware.");
  }

  const router = Router();
  router.get("/profile", authenticate, getProfile);
  router.put("/profile", authenticate, updateProfile);
  router.post("/profile/photo", authenticate, uploadSingleProfilePhoto, createProfilePhotoController(mediaService));
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
