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
  const values = {
    talentType: input.talentType,
    instruments,
    bio: typeof input.bio === "string" ? input.bio.trim() : "",
    yearsExperience: Number(input.yearsExperience),
    profilePhotoUrl: typeof input.profilePhotoUrl === "string" ? input.profilePhotoUrl.trim() : "",
  };

  validateProfile(values);

  return TalentProfile.findOneAndUpdate(
    { userId: talentUserId },
    { $set: values, $setOnInsert: { userId: talentUserId } },
    { new: true, upsert: true, runValidators: true },
  );
}
