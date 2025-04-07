import express from 'express';
import { usersController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { catchError } from '../middleware/catch.error.js';

export const userRouter = new express.Router();

userRouter.get(
  '/profile',
  catchError(authMiddleware),
  catchError(usersController.getUserProfile),
);

userRouter.put(
  '/profile/name',
  catchError(authMiddleware),
  catchError(usersController.updateUserName),
);

userRouter.put(
  '/profile/password',
  catchError(authMiddleware),
  catchError(usersController.changePassword),
);

userRouter.put(
  '/profile/email',
  catchError(authMiddleware),
  catchError(usersController.changeEmail),
);
