import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export const userRouter = Router();

userRouter.get('/profile', authMiddleware, userController.getProfile);
userRouter.post('/profile/name', authMiddleware, userController.updateName);

userRouter.post(
  '/profile/password',
  authMiddleware,
  userController.updatePassword,
);
userRouter.post('/profile/email', authMiddleware, userController.updateEmail);
