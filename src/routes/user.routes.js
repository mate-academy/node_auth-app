import express from 'express';
import {
  loadAllActivated,
  verifyPassword,
  rename,
  resetEmail,
  resetPassword,
  verifyEmail,
} from '../controllers/user.controllers.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../middlewares/catchError.js';

export const userRouter = express.Router();

userRouter.get('/users', authMiddleware, catchError(loadAllActivated));

userRouter.post('/verify-password', authMiddleware, catchError(verifyPassword));

userRouter.post('/rename', authMiddleware, catchError(rename));

userRouter.post('/verify-email', authMiddleware, catchError(verifyEmail));

userRouter.post('/reset-email', authMiddleware, catchError(resetEmail));

userRouter.post('/reset-password', authMiddleware, catchError(resetPassword));
