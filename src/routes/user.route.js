import express from 'express';
import { userController } from '../controlles/user.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';

export const userRouter = new express.Router();

userRouter.get('/:id', authMiddleware, catchError(userController.user));

userRouter.post(
  '/:id/change-name',
  authMiddleware,
  catchError(userController.changeName),
);

userRouter.post(
  '/:id/change-password',
  authMiddleware,
  catchError(userController.changePassword),
);

userRouter.post(
  '/:id/change-email',
  authMiddleware,
  catchError(userController.changeEmail),
);
