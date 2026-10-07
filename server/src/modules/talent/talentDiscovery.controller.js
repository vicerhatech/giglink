export function createTalentDiscoveryController(discoveryService) {
  function requireTalent(request) {
    if (!request.user) {
      const error = new Error("Authentication is required.");
      error.statusCode = 401;
      throw error;
    }
    return request.user;
  }

  return {
    async listGigs(request, response, next) {
      try {
        const data = await discoveryService.listGigs(requireTalent(request));
        response.status(200).json({
          success: true,
          message: "Available gigs retrieved.",
          data,
        });
      } catch (error) {
        next(error);
      }
    },

    async getGig(request, response, next) {
      try {
        const data = await discoveryService.getGig(requireTalent(request), request.params.id);
        response.status(200).json({
          success: true,
          message: "Gig details retrieved.",
          data,
        });
      } catch (error) {
        next(error);
      }
    },
  };
}
