import { Router } from 'express';
import { userController } from './user.controller.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';

export const userRouter = Router();

userRouter.get('/', authMiddleware, userController.getAll);
userRouter.get('/:id', userController.getById);
userRouter.post('/', userController.create);
userRouter.patch('/:id', userController.update);
userRouter.delete('/:id', userController.deleteOne);
