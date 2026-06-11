import express, { type Request, type Response } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../lib/catchError.js';
import { validateMiddleware } from '../middlewares/validateMiddleware.js';
import {
  updateEmailSchema,
  updateNameSchema,
  updatePasswordSchema,
} from '../schemas/auth.validation.js';

export const userRouter = express.Router();

userRouter.get('/', authMiddleware, catchError(userController.getUsers));

userRouter.patch(
  '/name',
  authMiddleware,
  validateMiddleware(updateNameSchema),
  catchError(userController.updateName),
);
userRouter.patch(
  '/email',
  authMiddleware,
  validateMiddleware(updateEmailSchema),
  catchError(userController.updateEmail),
);
userRouter.patch(
  '/password',
  authMiddleware,
  validateMiddleware(updatePasswordSchema),
  catchError(userController.updatePassword),
);
