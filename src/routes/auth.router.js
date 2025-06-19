import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../service/catchError.service.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

export const authRouter = express.Router();

authRouter.post('/registration', catchError(authController.register));

authRouter.get(
  '/activation/:name/:activationToken',
  catchError(authController.activate),
);
authRouter.post('/login', catchError(authController.login));
authRouter.post('/forgot-password', catchError(authController.forgotPassword));

authRouter.patch(
  '/reset-password/:name/:resetpasswordtoken',
  catchError(authController.resetPassword),
);
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.post('/logout', authMiddleware, catchError(authController.logout));

authRouter.patch(
  '/change-name',
  authMiddleware,
  catchError(authController.changeName),
);

authRouter.patch(
  '/change-password',
  authMiddleware,
  catchError(authController.changePassword),
);

authRouter.post(
  '/change-email',
  authMiddleware,
  catchError(authController.changeEmail),
);

authRouter.get(
  '/set-new-email/:name/:changeemailtoken',
  catchError(authController.setNewEmail),
);
