import { Router } from 'express';
import { authController } from './../controllers/index.js';
import { authMiddleware } from './../middlewares/index.js';
import { catchError } from './../utils/catchError.js';

export const authRouter = new Router();

authRouter.post('/registration', catchError(authController.register));

authRouter.get(
  '/activation/:activationToken',
  catchError(authController.activate),
);

authRouter.post('/login', catchError(authController.login));

authRouter.post('/reset-password', catchError(authController.resetPassword));

authRouter.post(
  '/reset-password/:resetPasswordToken',
  catchError(authController.changePassword),
);

authRouter.get('/profile', authMiddleware, catchError(authController.getUser));

authRouter.patch(
  '/profile',
  authMiddleware,
  catchError(authController.updateUser),
);

authRouter.get(
  '/confirmation-email/:changeEmailToken',
  catchError(authController.changeEmail),
);

authRouter.get('/refresh', catchError(authController.refresh));

authRouter.post('/logout', catchError(authController.logout));
