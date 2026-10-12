export function createMediaController(mediaService) {
  return {
    async uploadVideo(request, response, next) {
      try {
        if (!request.user) {
          const error = new Error("Authentication is required.");
          error.statusCode = 401;
          throw error;
        }
        if (request.user.role !== "talent") {
          const error = new Error("Only talent accounts can upload audition videos.");
          error.statusCode = 403;
          throw error;
        }

        const video = await mediaService.uploadAuditionVideo(request.file);
        response.status(201).json({ success: true, message: "Video uploaded.", data: { video } });
      } catch (error) {
        next(error);
      }
    },
  };
}
