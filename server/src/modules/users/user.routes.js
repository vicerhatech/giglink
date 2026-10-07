import { Router } from "express";
import { requireAuthenticatedUser } from "../auth/auth.middleware.js";
import { updateCurrentUser } from "./user.controller.js";

export const userRouter = Router();

userRouter.patch("/me", requireAuthenticatedUser, updateCurrentUser);
