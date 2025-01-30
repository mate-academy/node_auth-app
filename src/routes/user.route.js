import express from 'express';
import { catchError } from '../utils/catchError.js';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export const userRouter = new express.Router();

userRouter.get(
  '/profile',
  authMiddleware,
  catchError(userController.getUserData),
);
