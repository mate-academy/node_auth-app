import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

export const userRouter = express.Router();

userRouter.get('/users', authMiddleware, userController.getAll);
