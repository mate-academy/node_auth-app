import { Router } from 'express';
import { userController } from './user.controller.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';

export const userRouter = Router();

userRouter.get('/', authMiddleware, userController.getAll);
