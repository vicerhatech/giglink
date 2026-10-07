import jwt from "jsonwebtoken";
import { AuthServiceError } from "./auth.service.js";
import { User } from "../users/user.model.js";

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    const error = new Error("JWT_SECRET is not configured.");
    error.statusCode = 500;
    throw error;
  }

  return process.env.JWT_SECRET;
}

export function createAuthToken(user) {
  return jwt.sign({ sub: user._id.toString() }, getJwtSecret(), { expiresIn: "7d" });
}

export async function requireAuthenticatedUser(request, _response, next) {
  try {
    const authorization = request.get("authorization");
    if (!authorization?.startsWith("Bearer ")) {
      throw new AuthServiceError("Authentication token is required.", 401);
    }

    const token = authorization.slice("Bearer ".length).trim();
    if (!token) {
      throw new AuthServiceError("Authentication token is required.", 401);
    }

    let payload;
    try {
      payload = jwt.verify(token, getJwtSecret());
    } catch (error) {
      if (error.statusCode === 500) {
        throw error;
      }

      throw new AuthServiceError("Invalid or expired authentication token.", 401);
    }

    if (typeof payload.sub !== "string" || !payload.sub) {
      throw new AuthServiceError("Invalid or expired authentication token.", 401);
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      throw new AuthServiceError("Invalid or expired authentication token.", 401);
    }

    if (user.accountStatus === "suspended") {
      throw new AuthServiceError("This account has been suspended.", 403);
    }

    request.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
