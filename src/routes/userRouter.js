import express from 'express';
import { userController } from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../middlewares/catchError.js';

export const userRouter = new express.Router();

userRouter.get(
  '/',
  catchError(authMiddleware),
  catchError(userController.getAll),
);

userRouter.patch('/profile/name', catchError(authMiddleware), catchError(userController.changeName));
userRouter.patch('/profile/password', catchError(authMiddleware), catchError(userController.changePassword));
userRouter.patch('/profile/email', catchError(authMiddleware), catchError(userController.changeEmail));