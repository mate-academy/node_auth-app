import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';

export const userRouter = new express.Router();

userRouter.get('/', authMiddleware, catchError(userController.getAllActivated));

userRouter.get(
  '/profile',
  authMiddleware,
  catchError(userController.getProfile),
);

userRouter.put(
  '/profile/name',
  authMiddleware,
  catchError(userController.changeName),
);

userRouter.put(
  '/profile/password',
  authMiddleware,
  catchError(userController.changePassword),
);

userRouter.put(
  '/profile/email',
  authMiddleware,
  catchError(userController.changeEmail),
);
