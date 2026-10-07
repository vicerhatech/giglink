import { AuthServiceError } from "../auth/auth.service.js";

const EDITABLE_PROFILE_FIELDS = new Set(["name", "phone"]);

function validateProfileUpdate(updates) {
  if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
    throw new AuthServiceError("Profile update data is required.");
  }

  const fields = Object.keys(updates);
  if (fields.length === 0) {
    throw new AuthServiceError("Provide a name or phone to update.");
  }

  if (fields.some((field) => !EDITABLE_PROFILE_FIELDS.has(field))) {
    throw new AuthServiceError("Only name and phone can be updated.");
  }

  for (const field of fields) {
    if (typeof updates[field] !== "string" || !updates[field].trim()) {
      throw new AuthServiceError(`${field} must be a non-empty string.`);
    }
  }
}

export async function updateOwnProfile(user, updates) {
  validateProfileUpdate(updates);

  for (const field of Object.keys(updates)) {
    user[field] = updates[field].trim();
  }

  await user.save();
  return user;
}

export { EDITABLE_PROFILE_FIELDS };
