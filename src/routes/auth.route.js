import express from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { catchError } from "../utils/catchError.js";
import { authMiddlewares } from "../middlewares/authMiddlewares.js";

export const authRouter = new express.Router();

authRouter.post("/registration", catchError(AuthController.registration));
authRouter.get("/activate/:activateToken", catchError(AuthController.activate));
authRouter.post("/login", catchError(AuthController.login));
authRouter.post("/refresh", catchError(AuthController.refresh));

authRouter.post("/reset-password", catchError(AuthController.requestPasswordReset));
authRouter.post("/reset-password/:token", catchError(AuthController.confirmPasswordReset));

authRouter.post("/logout", authMiddlewares, catchError(AuthController.logout));
authRouter.patch("/profile/name", authMiddlewares, catchError(AuthController.changeName));
authRouter.patch("/profile/password", authMiddlewares, catchError(AuthController.changePassword));
authRouter.patch("/profile/email", authMiddlewares, catchError(AuthController.changeEmail));
