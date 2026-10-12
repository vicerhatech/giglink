import bcrypt from "bcryptjs";
import { USER_ROLES, User } from "../users/user.model.js";
import { serializeUser } from "../users/user.serializer.js";

const PASSWORD_SALT_ROUNDS = 12;

export class AuthServiceError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "AuthServiceError";
    this.statusCode = statusCode;
  }
}

function normaliseEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function requireRegistrationFields({ name, email, password, phone, role }) {
  if (!name?.trim() || !email || !password || !phone?.trim() || !role) {
    throw new AuthServiceError("Name, email, password, phone, and role are required.");
  }

  if (!USER_ROLES.includes(role)) {
    throw new AuthServiceError("Invalid user role.");
  }
}

export async function registerUser({ name, email, password, phone, role }) {
  const normalizedEmail = normaliseEmail(email);
  requireRegistrationFields({ name, email: normalizedEmail, password, phone, role });

  const existingUser = await User.exists({ email: normalizedEmail });
  if (existingUser) {
    throw new AuthServiceError("An account with this email already exists.", 409);
  }

  const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

  try {
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      phone: phone.trim(),
      role,
    });

    return user;
  } catch (error) {
    if (error?.code === 11000) {
      throw new AuthServiceError("An account with this email already exists.", 409);
    }

    throw error;
  }
}

export async function validateCredentials({ email, password }) {
  const normalizedEmail = normaliseEmail(email);
  if (!normalizedEmail || !password) {
    throw new AuthServiceError("Email and password are required.");
  }

  const user = await User.findOne({ email: normalizedEmail }).select("+passwordHash");
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AuthServiceError("Invalid email or password.", 401);
  }

  if (user.accountStatus === "suspended") {
    throw new AuthServiceError("This account has been suspended.", 403);
  }

  return user;
}

export function isUserActive(user) {
  return user?.accountStatus === "active";
}

export { serializeUser };
