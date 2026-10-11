const MANAGEABLE_ROLES = ["customer", "talent"];
const ACCOUNT_STATUSES = ["active", "suspended"];
const SAFE_USER_FIELDS = "_id name email phone role accountStatus paidGigSubscriptionRequired createdAt updatedAt";

export class AdminUserManagementError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "AdminUserManagementError";
    this.statusCode = statusCode;
  }
}

function publicUser(user) {
  if (!user) return null;

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    accountStatus: user.accountStatus,
    paidGigSubscriptionRequired: Boolean(user.paidGigSubscriptionRequired),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function assertManageableRole(role) {
  if (role && !MANAGEABLE_ROLES.includes(role)) {
    throw new AdminUserManagementError("Users can only be filtered by customer or talent role.");
  }
}

function assertAccountStatus(accountStatus) {
  if (!ACCOUNT_STATUSES.includes(accountStatus)) {
    throw new AdminUserManagementError("Account status must be active or suspended.");
  }
}

/**
 * Adapter for Student 1's User model. It deliberately selects the safe public
 * fields and limits admin management to customer and talent accounts.
 */
export function createMongooseUserRepository({ User } = {}) {
  if (!User?.find || !User?.findOne || !User?.findOneAndUpdate) {
    throw new Error("Admin user management needs the Student 1 User model.");
  }

  return {
    async listUsers({ role, accountStatus } = {}) {
      const filter = { role: role || { $in: MANAGEABLE_ROLES } };
      if (accountStatus) filter.accountStatus = accountStatus;
      return User.find(filter).select(SAFE_USER_FIELDS).sort({ createdAt: -1 }).lean();
    },

    async findManageableUserById({ userId }) {
      return User.findOne({ _id: userId, role: { $in: MANAGEABLE_ROLES } })
        .select(SAFE_USER_FIELDS)
        .lean();
    },

    async updateAccountStatus({ userId, accountStatus }) {
      return User.findOneAndUpdate(
        { _id: userId, role: { $in: MANAGEABLE_ROLES } },
        { $set: { accountStatus } },
        { new: true, runValidators: true },
      ).select(SAFE_USER_FIELDS).lean();
    },
  };
}

export function createAdminUserManagementService({ userRepository } = {}) {
  if (!userRepository?.listUsers
    || !userRepository?.findManageableUserById
    || !userRepository?.updateAccountStatus) {
    throw new Error("Admin user management needs the User repository adapter.");
  }

  return {
    async listUsers({ role, accountStatus } = {}) {
      assertManageableRole(role);
      if (accountStatus) assertAccountStatus(accountStatus);
      const users = await userRepository.listUsers({ role, accountStatus });
      return users.map(publicUser);
    },

    async getUser({ userId }) {
      const user = await userRepository.findManageableUserById({ userId });
      if (!user) throw new AdminUserManagementError("User not found.", 404);
      return publicUser(user);
    },

    async updateAccountStatus({ actorId, userId, accountStatus }) {
      if (!userId) throw new AdminUserManagementError("User id is required.");
      if (String(actorId) === String(userId)) {
        throw new AdminUserManagementError("Admins cannot change their own account status.", 403);
      }
      assertAccountStatus(accountStatus);

      const user = await userRepository.updateAccountStatus({ userId, accountStatus });
      if (!user) throw new AdminUserManagementError("User not found.", 404);
      return publicUser(user);
    },
  };
}
