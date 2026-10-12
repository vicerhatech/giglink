import {
  cancelCustomerGig,
  createGigDraft,
  getCustomerGig,
  listCustomerGigs,
  updateCustomerGig,
} from "./gig.service.js";

function sendSuccess(response, statusCode, message, data) {
  response.status(statusCode).json({ success: true, message, data });
}

function customerIdFrom(request) {
  return request.user?._id || request.user?.id || request.user?.userId;
}

export async function createGig(request, response, next) {
  try {
    const gig = await createGigDraft(customerIdFrom(request), request.body);
    sendSuccess(response, 201, "Gig draft created.", { gig });
  } catch (error) {
    next(error);
  }
}

export async function getMyGigs(request, response, next) {
  try {
    const gigs = await listCustomerGigs(customerIdFrom(request));
    sendSuccess(response, 200, "Customer gigs retrieved.", { gigs });
  } catch (error) {
    next(error);
  }
}

export async function getGigById(request, response, next) {
  try {
    const gig = await getCustomerGig(customerIdFrom(request), request.params.id);
    sendSuccess(response, 200, "Gig retrieved.", { gig });
  } catch (error) {
    next(error);
  }
}

export async function updateGig(request, response, next) {
  try {
    const gig = await updateCustomerGig(customerIdFrom(request), request.params.id, request.body);
    sendSuccess(response, 200, "Gig updated.", { gig });
  } catch (error) {
    next(error);
  }
}

export async function cancelGig(request, response, next) {
  try {
    const gig = await cancelCustomerGig(customerIdFrom(request), request.params.id);
    sendSuccess(response, 200, "Gig cancelled.", { gig });
  } catch (error) {
    next(error);
  }
}
