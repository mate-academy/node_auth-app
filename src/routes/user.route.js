import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';

export const userRouter = new express.Router();

userRouter.get('/', authMiddleware, catchError(userController.getAllActivated));
userRouter.put('/profile', authMiddleware, catchError(userController.updateProfile));
userRouter.post('/change-password', authMiddleware, catchError(userController.changePassword));
userRouter.post('/change-email', authMiddleware, catchError(userController.changeEmail));
