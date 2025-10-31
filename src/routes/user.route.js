import express from 'express';
import { userController } from '../controller/user.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';

export const userRouter = new express.Router();

userRouter.get('/', authMiddleware, catchError(userController.getAllActivated));

userRouter.patch(
  '/name',
  authMiddleware,
  catchError(userController.updateName),
);

userRouter.patch(
  '/password',
  authMiddleware,
  catchError(userController.changePassword),
);

userRouter.patch(
  '/email',
  authMiddleware,
  catchError(userController.changeEmail),
);
