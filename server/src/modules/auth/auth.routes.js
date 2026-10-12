import { Router } from "express";
import { getCurrentUser, login, register, requireAuthenticatedUser } from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me", requireAuthenticatedUser, getCurrentUser);
