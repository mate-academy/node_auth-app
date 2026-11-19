import express from 'express';
import { authController } from '../controllers/auth.controller.js'
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';
import { userController } from '../controllers/user.controller.js';

export const userRouter = new express.Router();

userRouter.get('/', authMiddleware, catchError(userController.getAll));
userRouter.get('/me', authMiddleware, catchError(userController.getMe));
userRouter.put('/me', authMiddleware, catchError(userController.updateUser));
userRouter.patch('/me/email', authMiddleware, catchError(userController.updateUserEmail));
userRouter.get('/me/changeEmail/activation/:activationToken', catchError(userController.activateEmailChange));