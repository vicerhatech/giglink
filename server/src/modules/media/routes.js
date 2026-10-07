import { Router } from "express";
import multer from "multer";
import { createMediaController } from "./media.controller.js";
import { createMediaService } from "./media.service.js";

export const MAX_AUDITION_VIDEO_SIZE_BYTES = 30 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_AUDITION_VIDEO_SIZE_BYTES, files: 1 },
  fileFilter: (_request, file, callback) => {
    if (file.mimetype?.startsWith("video/")) return callback(null, true);
    const error = new Error("Only video files can be uploaded.");
    error.statusCode = 400;
    callback(error);
  },
});

function uploadSingleVideo(request, response, next) {
  upload.single("video")(request, response, (error) => {
    if (error?.code === "LIMIT_FILE_SIZE") {
      error.message = "Video files must be 30 MB or smaller.";
      error.statusCode = 413;
    }
    next(error);
  });
}

export function createMediaRouter({ authenticate, mediaService = createMediaService() }) {
  if (typeof authenticate !== "function") throw new TypeError("createMediaRouter requires the shared authenticate middleware.");
  const router = Router();
  router.post("/videos", authenticate, uploadSingleVideo, createMediaController(mediaService).uploadVideo);
  return router;
}
