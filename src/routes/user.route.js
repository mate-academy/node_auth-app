import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';
import { userController } from '../controllers/user.controller.js';

export const userRouter = new express.Router();

userRouter.get('/', authMiddleware, catchError(userController.getAllActivated));

userRouter.put(
  '/profile/name',
  authMiddleware,
  catchError(userController.updateName),
);

userRouter.put(
  '/profile/password',
  authMiddleware,
  catchError(userController.updatePassword),
);

userRouter.put(
  '/profile/email',
  authMiddleware,
  catchError(userController.updateEmail),
);
