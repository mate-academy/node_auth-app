import { Router } from "express";
import { profileControllers } from "../controllers/profile.controller.js";
import { catchError } from "../../utils/catchError.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

export const profileRouter = Router();

profileRouter.patch('/name', authMiddleware, catchError(profileControllers.changeName));
profileRouter.patch('/password', authMiddleware, catchError(profileControllers.changePassword));
profileRouter.patch('/email', authMiddleware, catchError(profileControllers.changeEmail));
