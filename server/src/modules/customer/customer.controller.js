import { getCustomerGig } from "../gigs/gig.service.js";
import { customerApplicationService } from "./customer.application-adapter.js";

function customerIdFrom(request) {
  return request.user?._id || request.user?.id || request.user?.userId;
}

function success(response, message, data) {
  response.status(200).json({ success: true, message, data });
}

function inputError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

async function ownedGig(request) {
  return getCustomerGig(customerIdFrom(request), request.params.gigId);
}

/** Ownership is established from the Gig before Student 3's service is called. */
export async function listGigApplications(request, response, next) {
  try {
    const gig = await ownedGig(request);
    const applications = await customerApplicationService.listApplicationsForCustomerGig({
      customerId: customerIdFrom(request), gigId: gig.id,
    });
    success(response, "Gig applications retrieved.", { gig, applications });
  } catch (error) { next(error); }
}

export async function getGigApplication(request, response, next) {
  try {
    const gig = await ownedGig(request);
    const application = await customerApplicationService.getApplicationWithDemoVideos({
      customerId: customerIdFrom(request), gigId: gig.id, applicationId: request.params.applicationId,
    });
    success(response, "Application retrieved.", { application });
  } catch (error) { next(error); }
}

export async function updateApplicationStatus(request, response, next) {
  try {
    const { status } = request.body || {};
    if (status !== "accepted" && status !== "rejected") throw inputError("status must be accepted or rejected.");
    const existing = await customerApplicationService.getApplicationWithDemoVideos({
      customerId: customerIdFrom(request), applicationId: request.params.applicationId,
    });
    await getCustomerGig(customerIdFrom(request), existing.gigId?._id || existing.gigId);
    // Student 3's service preserves its own slot-capacity and paid-gig subscription
    // handoff rules. This controller only invokes its approved decision methods.
    const application = status === "accepted"
      ? await customerApplicationService.acceptApplication({ customerId: customerIdFrom(request), applicationId: request.params.applicationId })
      : await customerApplicationService.rejectApplication({ customerId: customerIdFrom(request), applicationId: request.params.applicationId });
    success(response, `Application ${status}.`, { application });
  } catch (error) { next(error); }
}
