import express from 'express';
import { userController } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { catchError } from '../middlewares/errorMiddleware';

export const userRouter = new express.Router();

userRouter.get(
  '/',
  catchError(authMiddleware),
  catchError(userController.getAll),
);
