export function gigDate(value, options = { day: "numeric", month: "short", year: "numeric" }) {
  if (!value) return "Date to be confirmed";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date to be confirmed" : date.toLocaleDateString("en-NG", options);
}
export function gigMoney(value) {
  return Number.isFinite(value) ? new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value) : "To be confirmed";
}
export function gigRoles(gig) {
  return [...new Set(gig.roles || (gig.positions || []).map(role => role.roleType === "backup_vocalist" ? "Backup vocalist" : role.instrument || "Instrumentalist"))];
}
