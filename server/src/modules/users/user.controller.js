import { serializeUser } from "./user.serializer.js";
import { updateOwnProfile } from "./user.service.js";

export async function updateCurrentUser(request, response, next) {
  try {
    const user = await updateOwnProfile(request.user, request.body);

    response.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: {
        user: serializeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
}
