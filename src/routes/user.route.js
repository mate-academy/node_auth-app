import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';

export const userRouter = new express.Router();

userRouter.get('/', authMiddleware, catchError(userController.getAllActivated));
userRouter.get('/:userId', authMiddleware, catchError(userController.getOne));
userRouter.patch('/:userId', authMiddleware, catchError(userController.update));
