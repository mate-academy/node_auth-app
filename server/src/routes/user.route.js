import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export const userRouter = express.Router()

userRouter.patch('/profile', authMiddleware, userController.updateName);
userRouter.patch('/profile/password', authMiddleware, userController.updatePassword);
userRouter.patch('/profile/email', authMiddleware, userController.updateEmail);
