import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';
import { guestMiddleware } from '../middlewares/guestMiddleware.js';

export const authRouter = express.Router();

authRouter.post('/registration', catchError(authController.register));

authRouter.get(
  '/activation/:activationToken',
  guestMiddleware,
  catchError(authController.activate),
);
authRouter.post('/login', guestMiddleware, catchError(authController.login));

authRouter.post(
  '/refresh',
  guestMiddleware,
  catchError(authController.refresh),
);

authRouter.post(
  '/password/reset',
  guestMiddleware,
  catchError(authController.sendResetMessage),
);

authRouter.post(
  '/password/reset/:resetPasswordToken',
  guestMiddleware,
  catchError(authController.resetPassword),
);
