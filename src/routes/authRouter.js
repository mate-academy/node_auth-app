import express from 'express';

import { authController } from '../controllers/authController.js';
import { catchError } from '../middlewares/catchError.js';

export const authRouter = new express.Router();

authRouter.post('/registration', catchError(authController.register));

authRouter.get(
  '/activation/:activationToken',
  catchError(authController.activate),
);
authRouter.post('/login', catchError(authController.login));
authRouter.post('/logout', catchError(authController.logout));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.post('/passwordReset', catchError(authController.reqPasswordReset));

authRouter.get(
  '/passwordReset/:passwordResetToken',
  catchError(authController.validatePasswordResetToken),
);

authRouter.post(
  '/passwordReset/:passwordResetToken',
  catchError(authController.passwordReset),
);
