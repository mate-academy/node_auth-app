import express from 'express';
import { userController } from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export const userRouter = new express.Router();

userRouter.get('/', authMiddleware, userController.getAll);
