import express from 'express';
import { catchError } from '../untils/catchError.js';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export const userRouter = new express.Router();

userRouter.get('/', authMiddleware, catchError(userController.getAllActivated));

userRouter.post(
  '/changeName/:userName',
  authMiddleware,
  catchError(userController.changeName),
);

userRouter.post(
  '/changePassword/:userName',
  authMiddleware,
  catchError(userController.changePassword),
);

userRouter.post(
  '/changeEmail/:userName',
  authMiddleware,
  catchError(userController.changeEmail),
);

userRouter.get(
  '/confirmation/:email/:resetToken',
  catchError(userController.activationNewEmail),
);
