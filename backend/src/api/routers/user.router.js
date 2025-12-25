import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { catchError } from "../../utils/catchError.js";

export const userRouter = Router();

userRouter.get('/', authMiddleware, catchError(userController.getAllActivated));
