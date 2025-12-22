import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { userController } from '../controllers/user.controller.js';

export const userRouter = Router();

userRouter.get('/', authMiddleware, userController.getAll);

userRouter.patch(
  '/settings',
  authMiddleware,
  userController.updateNameOrPassword,
);
userRouter.patch('/email', authMiddleware, userController.updateEmail);
