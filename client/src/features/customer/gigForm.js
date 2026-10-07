export const ADVISORY = "For the best results, post your gig at least 2 months before the event. This gives talents enough time to apply and submit demos, and gives you enough time to review applicants and select the best fit.";

export const blankPosition = () => ({
  roleType: "instrumentalist",
  instrument: "",
  slots: 1,
  auditionSongs: ["", "", ""],
});

export const blankGig = () => ({
  title: "",
  eventType: "",
  description: "",
  eventDate: "",
  eventTime: "",
  location: "",
  applicationDeadline: "",
  gigType: "free",
  paymentMin: "",
  paymentMax: "",
  positions: [blankPosition()],
});

export function gigToForm(gig) {
  return {
    title: gig.title || "",
    eventType: gig.eventType || "",
    description: gig.description || "",
    eventDate: toDateInput(gig.eventDate),
    eventTime: gig.eventTime || "",
    location: gig.location || "",
    applicationDeadline: toDateInput(gig.applicationDeadline),
    gigType: gig.gigType || "free",
    paymentMin: gig.paymentRange?.min?.toString() || "",
    paymentMax: gig.paymentRange?.max?.toString() || "",
    positions: gig.positions?.map((position) => ({
      roleType: position.roleType,
      instrument: position.instrument || "",
      slots: position.slots,
      auditionSongs: [...position.auditionSongs],
    })) || [blankPosition()],
  };
}

function toDateInput(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

export function validateAndSerialize(form) {
  const errors = {};
  for (const field of ["title", "eventType", "description", "eventDate", "eventTime", "location", "applicationDeadline"]) {
    if (!String(form[field] || "").trim()) errors[field] = "This field is required.";
  }

  let paymentRange = null;
  if (form.gigType === "paid") {
    const min = Number(form.paymentMin);
    const max = Number(form.paymentMax);
    if (!Number.isInteger(min) || min < 25000) errors.paymentMin = "Minimum talent payment is ₦25,000.";
    if (!Number.isInteger(max) || max < min) errors.paymentMax = "Maximum must be at least the minimum.";
    paymentRange = { min, max };
  }

  const positions = form.positions.map((position, index) => {
    const label = `Position ${index + 1}`;
    if (position.roleType === "instrumentalist" && !position.instrument.trim()) errors[`instrument-${index}`] = `${label}: instrument is required.`;
    if (!Number.isInteger(Number(position.slots)) || Number(position.slots) < 1) errors[`slots-${index}`] = `${label}: use at least one slot.`;
    position.auditionSongs.forEach((song, songIndex) => {
      if (!song.trim()) errors[`song-${index}-${songIndex}`] = `${label}: song ${songIndex + 1} is required.`;
    });
    return {
      roleType: position.roleType,
      instrument: position.roleType === "instrumentalist" ? position.instrument.trim() : null,
      slots: Number(position.slots),
      auditionSongs: position.auditionSongs.map((song) => song.trim()),
    };
  });
  if (!positions.length) errors.positions = "Add at least one required position.";
  if (Object.keys(errors).length) return { errors };

  return {
    payload: {
      title: form.title.trim(), eventType: form.eventType.trim(), description: form.description.trim(),
      eventDate: form.eventDate, eventTime: form.eventTime.trim(), location: form.location.trim(),
      applicationDeadline: form.applicationDeadline, gigType: form.gigType, paymentRange, positions,
    },
  };
}
