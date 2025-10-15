import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { catchError } from '../utils/catchError.js';

export const userRouter = new express.Router();

userRouter.get('/', authMiddleware, catchError(userController.getAllActivated));

userRouter.get('/me', authMiddleware, catchError(userController.getProfile));

userRouter.put('/name', authMiddleware, catchError(userController.changeName));

userRouter.put(
  '/password',
  authMiddleware,
  catchError(userController.changePassword),
);

userRouter.put(
  '/email',
  authMiddleware,
  catchError(userController.changeEmail),
);
