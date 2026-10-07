import { getTalentProfile, saveTalentProfile } from "./talentProfile.service.js";

function getTalentUserId(request) {
  if (!request.user) {
    const error = new Error("Authentication is required.");
    error.statusCode = 401;
    throw error;
  }

  if (request.user.role !== "talent") {
    const error = new Error("Only talent accounts can access talent profiles.");
    error.statusCode = 403;
    throw error;
  }

  return request.user._id || request.user.id;
}

export async function getProfile(request, response, next) {
  try {
    const profile = await getTalentProfile(getTalentUserId(request));
    response.status(200).json({
      success: true,
      message: "Talent profile retrieved.",
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(request, response, next) {
  try {
    const profile = await saveTalentProfile(getTalentUserId(request), request.body);
    response.status(200).json({
      success: true,
      message: "Talent profile saved.",
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
}
