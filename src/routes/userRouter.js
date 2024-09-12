import express from 'express';

import { userController } from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';

export const userRouter = new express.Router();

userRouter.get('/', authMiddleware, catchError(userController.getAllActivated));
userRouter.patch('/:id/change-name', authMiddleware, catchError(userController.changeName));
userRouter.patch('/:id/change-password', authMiddleware, catchError(userController.changePassword));
userRouter.patch('/:id/change-email', authMiddleware, catchError(userController.changeEmail));
