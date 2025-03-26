import express from 'express';
import { getCurrentUser, updateUser } from '../controllers/users.controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { catchError } from '../utils/catchError.js';

export const userRouter = express.Router();

userRouter.get('/:userId', authMiddleware, catchError(getCurrentUser));
userRouter.patch('/:userId', authMiddleware, catchError(updateUser));
