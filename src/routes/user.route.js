import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';
import { ApiError } from '../exeptions/api.error.js';

export const userRouter = new express.Router();

userRouter.put('/name', authMiddleware, catchError(userController.updateName));

userRouter.put(
  '/password',
  authMiddleware,
  catchError(userController.updatePassword),
);

userRouter.put(
  '/email',
  authMiddleware,
  catchError(userController.updateEmail),
);

userRouter.get(
  '/me',
  authMiddleware,
  catchError(async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
      throw ApiError.unauthorized();
    }

    const user = await userController.getUserById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    res.send({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  }),
);
