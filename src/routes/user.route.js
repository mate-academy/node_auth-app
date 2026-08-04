import express from 'express';

import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';

export const userRouter = new express.Router();

userRouter.get(
  '/profile/email/confirm/:token',
  catchError(userController.confirmEmailChange),
);

userRouter.get(
  '/profile',
  authMiddleware,
  catchError(userController.getProfile),
);

userRouter.patch(
  '/profile/name',
  authMiddleware,
  catchError(userController.updateName),
);

userRouter.patch(
  '/profile/password',
  authMiddleware,
  catchError(userController.updatePassword),
);

userRouter.post(
  '/profile/email',
  authMiddleware,
  catchError(userController.requestEmailChange),
);
