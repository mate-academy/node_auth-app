import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { catchError } from '../utils/catchError.js';

export const userRouter = new express.Router();

userRouter.get(
  '/',
  catchError(authMiddleware),
  catchError(userController.getAllActivated),
);
