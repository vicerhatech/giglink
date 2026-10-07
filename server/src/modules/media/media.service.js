import { v2 as cloudinary } from "cloudinary";

const requiredCloudinaryVariables = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];

function mediaError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function configureCloudinary() {
  if (requiredCloudinaryVariables.some((name) => !process.env[name])) {
    throw mediaError("Cloudinary upload is not configured on the server.", 503);
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export function createMediaService({ uploader = cloudinary.uploader } = {}) {
  return {
    async uploadAuditionVideo(file) {
      if (!file) throw mediaError("A video file is required.");
      if (!file.mimetype?.startsWith("video/")) throw mediaError("Only video files can be uploaded.");
      configureCloudinary();

      return new Promise((resolve, reject) => {
        const stream = uploader.upload_stream(
          { resource_type: "video", folder: "giglink/auditions" },
          (error, result) => {
            if (error) return reject(mediaError("Video upload failed. Please try again.", 502));
            resolve({ videoUrl: result.secure_url, cloudinaryPublicId: result.public_id });
          },
        );
        stream.end(file.buffer);
      });
    },
  };
}
