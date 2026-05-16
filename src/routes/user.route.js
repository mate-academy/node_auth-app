import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';

export const userRouter = express.Router();

userRouter.get(
  '/users',
  authMiddleware,
  catchError(userController.getAllActivated),
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

userRouter.patch(
  '/profile/email',
  authMiddleware,
  catchError(userController.updateEmail),
);
