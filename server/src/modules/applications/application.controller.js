export function createApplicationController(applicationService) {
  return {
    async submit(request, response, next) {
      try {
        if (!request.user) {
          const error = new Error("Authentication is required.");
          error.statusCode = 401;
          throw error;
        }
        const application = await applicationService.submitApplication({
          talent: request.user,
          gigId: request.params.gigId,
          positionId: request.params.positionId,
          ...request.body,
        });
        response.status(201).json({
          success: true,
          message: "Application submitted.",
          data: { application },
        });
      } catch (error) {
        next(error);
      }
    },

    async listMine(request, response, next) {
      try {
        if (!request.user) {
          const error = new Error("Authentication is required.");
          error.statusCode = 401;
          throw error;
        }
        const applications = await applicationService.listApplicationsForTalent(request.user);
        response.status(200).json({
          success: true,
          message: "Applications retrieved.",
          data: { applications },
        });
      } catch (error) {
        next(error);
      }
    },

    async withdraw(request, response, next) {
      try {
        if (!request.user) {
          const error = new Error("Authentication is required.");
          error.statusCode = 401;
          throw error;
        }
        const application = await applicationService.withdrawApplication({
          talent: request.user,
          applicationId: request.params.id,
        });
        response.status(200).json({
          success: true,
          message: "Application withdrawn.",
          data: { application },
        });
      } catch (error) {
        next(error);
      }
    },
  };
}
