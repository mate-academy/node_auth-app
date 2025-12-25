import { Router } from "express";
import { catchError } from "../../utils/catchError.js";
import { passwordResetController } from "../controllers/passwordReset.controller.js";

export const passwordResetRouter = Router();

passwordResetRouter.post('/', catchError(passwordResetController.sendPasswordReset));
passwordResetRouter.post('/confirm/:token', catchError(passwordResetController.confirmPasswordReset));
