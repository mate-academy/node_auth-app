import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';

export const userRouter = new express.Router();

userRouter.get('/', authMiddleware, catchError(userController.getAllActivated));
userRouter.patch('/me', authMiddleware, catchError(userController.updateName));

userRouter.patch(
  '/me/password',
  authMiddleware,
  catchError(userController.changePassword),
);

userRouter.post(
  '/me/email-request',
  authMiddleware,
  catchError(userController.requestEmailChange),
);

userRouter.post(
  '/me/email-confirm',
  authMiddleware,
  catchError(userController.confirmEmailChange),
);
