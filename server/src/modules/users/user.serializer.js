export function serializeUser(user) {
  const source = typeof user.toObject === "function" ? user.toObject() : user;

  return {
    id: source._id?.toString() ?? source.id,
    name: source.name,
    email: source.email,
    phone: source.phone,
    role: source.role,
    accountStatus: source.accountStatus,
    paidGigSubscriptionRequired: source.paidGigSubscriptionRequired,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };
}
