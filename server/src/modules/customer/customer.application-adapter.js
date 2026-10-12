/**
 * Boundary for Student 3's Application service. The Captain supplies the
 * exported application.service.js implementation during cross-branch wiring.
 * This module deliberately contains no Application persistence or rules.
 */
let applicationService;

export function configureCustomerApplicationService(service) {
  applicationService = service;
}

function unavailable() {
  const error = new Error("Applicant review is awaiting the Application service integration.");
  error.statusCode = 503;
  return error;
}

function method(name) {
  if (!applicationService || typeof applicationService[name] !== "function") throw unavailable();
  return applicationService[name].bind(applicationService);
}

export const customerApplicationService = {
  listApplicationsForCustomerGig: (context) => method("listApplicationsForCustomerGig")(context),
  getApplicationWithDemoVideos: (context) => method("getApplicationWithDemoVideos")(context),
  acceptApplication: (context) => method("acceptApplication")(context),
  rejectApplication: (context) => method("rejectApplication")(context),
  countAcceptedApplicationsForPosition: (context) => method("countAcceptedApplicationsForPosition")(context),
};
