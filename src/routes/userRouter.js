import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';

export const userRouter = new Router();

userRouter.get(
  '/',
  catchError(authMiddleware),
  catchError(userController.getAllActivated),
);

userRouter.patch(
  '/updateName',
  catchError(authMiddleware),
  catchError(userController.updateName)
);

userRouter.patch(
  '/updateEmail',
  catchError(authMiddleware),
  catchError(userController.updateEmail)
);
