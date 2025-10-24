import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';

export const authRouter = new Router();

authRouter.post('/auth/registration', catchError(authController.register));

authRouter.get(
  '/auth/activation/:email/:activationToken',
  catchError(authController.activation),
);
authRouter.post('/auth/login', catchError(authController.login));
authRouter.get('/auth/refresh', catchError(authController.refresh));
authRouter.post('/auth/logout', catchError(authController.logout));

authRouter.post(
  '/auth/send_recovery_email',
  catchError(authController.emailSend),
);

authRouter.post(
  '/auth/reset_password',
  catchError(authController.resetPassword),
);
