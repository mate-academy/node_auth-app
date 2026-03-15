import { Router } from 'express';
import cookieParser from 'cookie-parser';

import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';

export const authRouter = Router();

authRouter.post('/registration', catchError(authController.register));

authRouter.get(
  '/activation/:email/:token',
  catchError(authController.activate),
);
authRouter.post('/login', catchError(authController.login));
authRouter.get('/refresh', cookieParser(), catchError(authController.refresh));
authRouter.post('/logout', catchError(authController.logout));

authRouter.post(
  '/request-password-reset',
  catchError(authController.requestPasswordReset),
);
authRouter.post('/reset-password', catchError(authController.resetPassword));

authRouter.get(
  '/reset-password/validate/:token',
  catchError(authController.validateResetToken),
);
