import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/authMiddlewares.js';
import { catchError } from '../utils/catchError.js';

export const userRouter = new express.Router();

userRouter.get(
  '/profile',
  authMiddleware,
  catchError(userController.getProfile),
);

userRouter.put(
  '/profile',
  authMiddleware,
  catchError(userController.updateProfile),
);
