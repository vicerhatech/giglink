import { Router } from "express";
import { requireAuthenticatedUser } from "../auth/auth.middleware.js";
import { updateCurrentUser } from "./user.controller.js";
import { deleteOwnAccount } from "./account-deletion.service.js";

export const userRouter = Router();

userRouter.patch("/me", requireAuthenticatedUser, updateCurrentUser);
userRouter.delete("/me", requireAuthenticatedUser, async (request, response, next) => {
  try {
    await deleteOwnAccount(request.user._id, request.body);
    response.status(200).json({ success: true, message: "Account deleted. Sign-in access and profile have been removed.", data: {} });
  } catch (error) { next(error); }
});
