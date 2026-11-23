import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';

export const userRouter = new express.Router();

userRouter.patch(
  '/profile',
  authMiddleware,
  catchError(userController.updateName),
);

userRouter.patch(
  '/profile/password',
  authMiddleware,
  catchError(userController.changePassword),
);

userRouter.patch(
  '/profile/email',
  authMiddleware,
  catchError(userController.requestEmailChange),
);

userRouter.get(
  '/email-change/:token',
  catchError(userController.confirmEmailChange),
);
