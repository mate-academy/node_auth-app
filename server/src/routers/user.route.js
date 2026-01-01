import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';
import { userController } from '../controllers/user.controller.js';
import { activatedMiddleware } from '../middlewares/activatedMiddleware.js';

export const userRouter = new express.Router();

userRouter.get('/info', authMiddleware, catchError(userController.getUser));
userRouter.patch(
  '/profile',
  authMiddleware,
  activatedMiddleware,
  catchError(userController.changeName),
);
userRouter.patch(
  '/update-password',
  authMiddleware,
  activatedMiddleware,
  catchError(userController.changePassword),
);
userRouter.patch(
  '/update-email',
  authMiddleware,
  activatedMiddleware,
  catchError(userController.changeEmail),
);
