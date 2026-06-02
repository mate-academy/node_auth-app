import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export const authRouter = express.Router();

authRouter.post('/registration', catchError(authController.register));

authRouter.get(
  '/activation/:activationToken',
  catchError(authController.activate),
);
authRouter.post('/login', catchError(authController.login));
authRouter.post('/refresh', catchError(authController.refresh));
authRouter.post('/logout', authMiddleware, catchError(authController.logout));
authRouter.post('/password/reset', catchError(authController.sendResetMessage));

authRouter.post(
  '/password/reset/:resetPasswordToken',
  catchError(authController.resetPassword),
);
