import { Router } from 'express';
import {
  updateEmail,
  updateName,
  updatePassword,
} from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';

export const userRouter = Router();

userRouter.use(authMiddleware);

userRouter.patch('/name', updateName);
userRouter.patch('/email', updateEmail);
userRouter.patch('/password', updatePassword);
