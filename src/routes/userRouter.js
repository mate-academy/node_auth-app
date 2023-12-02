import express from 'express';
import { catchError } from '../middlewares/catchError.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { userController } from '../controllers/userController.js';

export const userRouter = new express.Router();

userRouter.patch(
  '/name',
  catchError(authMiddleware),
  catchError(userController.updateName),
);

userRouter.patch(
  '/email',
  catchError(authMiddleware),
  catchError(userController.updateEmail),
);

userRouter.patch(
  '/password',
  catchError(authMiddleware),
  catchError(userController.updatePassword),
);
