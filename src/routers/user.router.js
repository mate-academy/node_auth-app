import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';

export const userRouter = new express.Router();

userRouter.post(
  '/change_name',
  authMiddleware,
  catchError(userController.updateUserName),
);

userRouter.post(
  '/change_password',
  authMiddleware,
  catchError(userController.updateUserPassword),
);

userRouter.post(
  '/change_email',
  authMiddleware,
  catchError(userController.sendNotificationEmail),
);

userRouter.post(
  '/activation_email/:newEmail/:activationEmailToken',
  catchError(userController.updateUserEmail),
);
