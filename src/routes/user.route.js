import express from 'express';
import { catchError } from '../utils/catchError.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { userController } from '../controllers/user.controller.js';

export const userRouter = new express.Router();

userRouter.get(
  '/profile',
  authMiddleware,
  catchError(userController.getProfile),
);
userRouter.put(
  '/changeName',
  authMiddleware,
  catchError(userController.changeName),
);
userRouter.put(
  '/changePassword',
  authMiddleware,
  catchError(userController.changePassword),
);
userRouter.put(
  '/changeEmail',
  authMiddleware,
  catchError(userController.changeEmail),
);
