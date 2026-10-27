import express from 'express';
import { userContoller } from '../controllers/user.conroller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';

export const userRouter = new express.Router();

userRouter.get('/', authMiddleware, catchError(userContoller.getAllActivated));
userRouter.patch(
  '/profile',
  authMiddleware,
  catchError(userContoller.updateProfile),
);
