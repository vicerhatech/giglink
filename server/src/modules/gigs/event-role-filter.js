function invalid(message) {
  const error = new Error(message); error.statusCode = 400; throw error;
}

export function buildEventRoleFilter({ role = "", instrument = "" } = {}) {
  if (typeof role !== "string" || !["", "instrumentalist", "backup_vocalist"].includes(role)) invalid("Choose instrumentalist or backup vocalist.");
  if (typeof instrument !== "string" || instrument.trim().length > 80) invalid("Instrument must be text of 80 characters or fewer.");
  const name = instrument.trim();
  if (role === "backup_vocalist" && name) invalid("Instrument filters apply only to instrumentalist roles.");
  if (!role && !name) return {};
  const match = {};
  if (role || name) match.roleType = role || "instrumentalist";
  if (name) match.instrument = new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
  return { positions: { $elemMatch: match } };
}
