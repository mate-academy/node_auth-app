import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';

export const userRouter = new express.Router();

userRouter.get('/', authMiddleware, catchError(userController.getAllActivated));
userRouter.patch('/profile/name', authMiddleware, catchError(userController.updateName));
userRouter.patch('/profile/email', authMiddleware, catchError(userController.updateEmail));
userRouter.patch('/profile/password', authMiddleware, catchError(userController.updatePassword));
