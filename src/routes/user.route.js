import express from 'express';
import { userController } from '../controlles/user.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export const userRouter = new express.Router();

userRouter.get('/:id', authMiddleware, userController.user);

