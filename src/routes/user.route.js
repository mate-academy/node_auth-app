import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';
export const userRouter = new express.Router();

userRouter.get('/:id', authMiddleware, catchError(userController.getUser));

userRouter.patch(
  '/email',
  authMiddleware,
  catchError(userController.changeEmail),
);

userRouter.patch(
  '/name',
  authMiddleware,
  catchError(userController.changeName),
);

userRouter.patch(
  '/password',
  authMiddleware,
  catchError(userController.changePassword),
);
