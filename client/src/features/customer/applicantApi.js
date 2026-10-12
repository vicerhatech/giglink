import { api } from "../../lib/api";

function unwrap(response) { return response.data?.data; }

export async function listGigApplicants(gigId) {
  return unwrap(await api.get(`/customer/gigs/${gigId}/applications`));
}

export async function setApplicantStatus(applicationId, status) {
  return unwrap(await api.patch(`/customer/applications/${applicationId}/status`, { status }));
}
