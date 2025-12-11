import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';

export const userRouter = new express.Router();

userRouter.get(
  '/users',
  authMiddleware,
  catchError(userController.getAllActivatedUsers),
);

userRouter.post('/profile', authMiddleware, catchError(userController.getUser));

userRouter.patch(
  '/profile-data',
  authMiddleware,
  catchError(userController.changeData),
);

userRouter.patch(
  '/change-password/:email',
  authMiddleware,
  catchError(userController.changePassword),
);

userRouter.patch(
  '/change-email/:email',
  authMiddleware,
  catchError(userController.changeEmail),
);
