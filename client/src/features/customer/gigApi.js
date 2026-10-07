import { api } from "../../lib/api";

function unwrap(response) {
  return response.data?.data;
}

export async function createGigDraft(payload) {
  return unwrap(await api.post("/gigs", payload));
}

export async function listMyGigs() {
  return unwrap(await api.get("/gigs/customer/mine"));
}

export async function getMyGig(id) {
  return unwrap(await api.get(`/gigs/customer/${id}`));
}

export async function updateGig(id, payload) {
  return unwrap(await api.patch(`/gigs/${id}`, payload));
}

export async function cancelGig(id) {
  return unwrap(await api.delete(`/gigs/${id}`));
}

export function apiMessage(error) {
  const details = error.response?.data?.errors;
  if (Array.isArray(details) && details.length) return details.join(" ");
  return error.response?.data?.message || error.message || "Something went wrong. Please try again.";
}
