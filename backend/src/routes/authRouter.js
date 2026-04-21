import express from 'express';

import { authController } from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { guestMiddleware } from '../middlewares/guestMiddleware.js';
import { catchError } from '../middlewares/catchError.js';

export const authRouter = new express.Router();

authRouter.post('/registration', catchError(guestMiddleware), catchError(authController.register));
authRouter.get(
  '/activation/:activationToken',
  catchError(guestMiddleware),
  catchError(authController.activate),
);
authRouter.post('/login', catchError(guestMiddleware), catchError(authController.login));
authRouter.post('/logout', authMiddleware, catchError(authController.logout));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.post('/password-reset', catchError(guestMiddleware), catchError(authController.requestPasswordReset));
authRouter.post(
  '/password-reset/:passwordResetToken',
  catchError(guestMiddleware),
  catchError(authController.resetPassword),
);
