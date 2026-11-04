export function dashboardPathForRole(role) {
  return { customer: "/customer/dashboard", talent: "/talent/dashboard", admin: "/admin/dashboard" }[role] || "/";
}
