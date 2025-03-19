import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export const authRouter = express.Router();

authRouter.get(
  '/activation/:activationToken',
  catchError(authController.activate),
);
authRouter.get('/refresh', catchError(authController.refresh));

authRouter.post('/registration', catchError(authController.register));
authRouter.post('/login', catchError(authController.login));
authRouter.post('/logout', catchError(authController.logout));

authRouter.post(
  '/password-reset',
  catchError(authController.sendResetPasswordLink),
);

authRouter.post(
  '/password-reset/:token',
  catchError(authController.resetPasswordConfirmation),
);

authRouter.put(
  '/update-name',
  authMiddleware,
  catchError(authController.updateName),
);

authRouter.put(
  '/update-password',
  authMiddleware,
  catchError(authController.updatePassword),
);

authRouter.put(
  '/update-email',
  authMiddleware,
  catchError(authController.updateEmail),
);
