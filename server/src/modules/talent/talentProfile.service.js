import { TalentProfile } from "./TalentProfile.js";

function profileError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeInstruments(instruments) {
  if (instruments === undefined) return undefined;
  if (!Array.isArray(instruments)) {
    throw profileError("Instruments must be an array.");
  }

  return [...new Set(instruments.map((instrument) => String(instrument).trim()).filter(Boolean))];
}

function normalizeGenres(genres) {
  if (genres === undefined) return undefined;
  if (!Array.isArray(genres)) throw profileError("Genres must be an array.");
  const normalized = [...new Set(genres.map((genre) => String(genre).trim()).filter(Boolean))];
  if (normalized.length > 12 || normalized.some((genre) => genre.length > 80)) {
    throw profileError("Provide up to 12 genres, each no longer than 80 characters.");
  }
  return normalized;
}

function validateProfile(values) {
  if (!["instrumentalist", "backup_vocalist"].includes(values.talentType)) {
    throw profileError("Talent type must be instrumentalist or backup_vocalist.");
  }

  if (values.talentType === "instrumentalist" && values.instruments.length === 0) {
    throw profileError("Instrumentalists must select at least one instrument.");
  }

  if (!Number.isInteger(values.yearsExperience) || values.yearsExperience < 0) {
    throw profileError("Years of experience must be a non-negative whole number.");
  }
}

export async function getTalentProfile(talentUserId) {
  return TalentProfile.findOne({ userId: talentUserId });
}

export async function saveTalentProfile(talentUserId, input) {
  const instruments = normalizeInstruments(input.instruments) ?? [];
  const genres = normalizeGenres(input.genres) ?? [];
  const values = {
    talentType: input.talentType,
    instruments,
    bio: typeof input.bio === "string" ? input.bio.trim() : "",
    yearsExperience: Number(input.yearsExperience),
    profilePhotoUrl: typeof input.profilePhotoUrl === "string" ? input.profilePhotoUrl.trim() : "",
    genres,
    city: typeof input.city === "string" ? input.city.trim() : "",
  };

  validateProfile(values);

  return TalentProfile.findOneAndUpdate(
    { userId: talentUserId },
    { $set: values, $setOnInsert: { userId: talentUserId } },
    { new: true, upsert: true, runValidators: true },
  );
}

export async function saveTalentProfilePhoto(talentUserId, photo) {
  if (!photo?.profilePhotoUrl || !photo?.profilePhotoPublicId) {
    throw profileError("A valid profile photo upload is required.");
  }

  const profile = await TalentProfile.findOneAndUpdate(
    { userId: talentUserId },
    { $set: { profilePhotoUrl: photo.profilePhotoUrl, profilePhotoPublicId: photo.profilePhotoPublicId } },
    { new: true, runValidators: true },
  );
  if (!profile) throw profileError("Save your basic talent profile before uploading a photo.", 409);
  return profile;
}
