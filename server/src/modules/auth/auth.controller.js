import { createAuthToken, requireAuthenticatedUser } from "./auth.middleware.js";
import { AuthServiceError, registerUser, serializeUser, validateCredentials } from "./auth.service.js";

const PUBLIC_REGISTRATION_ROLES = new Set(["customer", "talent"]);

function sendAuthenticatedUser(response, statusCode, message, user) {
  response.status(statusCode).json({
    success: true,
    message,
    data: {
      token: createAuthToken(user),
      user: serializeUser(user),
    },
  });
}

export async function register(request, response, next) {
  try {
    const { name, email, password, phone, role } = request.body ?? {};
    if (!PUBLIC_REGISTRATION_ROLES.has(role)) {
      throw new AuthServiceError("Registration role must be customer or talent.");
    }

    const user = await registerUser({ name, email, password, phone, role });
    sendAuthenticatedUser(response, 201, "Registration successful.", user);
  } catch (error) {
    next(error);
  }
}

export async function login(request, response, next) {
  try {
    const { email, password } = request.body ?? {};
    const user = await validateCredentials({ email, password });
    sendAuthenticatedUser(response, 200, "Login successful.", user);
  } catch (error) {
    next(error);
  }
}

export function getCurrentUser(request, response) {
  response.status(200).json({
    success: true,
    message: "Authenticated user retrieved.",
    data: {
      user: serializeUser(request.user),
    },
  });
}

export { requireAuthenticatedUser };
