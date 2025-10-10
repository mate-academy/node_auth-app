/* eslint-disable max-len */
import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';
import { getAllActivated } from '../controllers/user/getAllActivated.controller.js';
import {
  confirmEmailChange,
  requestEmailChange,
  updateName,
  updatePassword,
} from '../controllers/user/update.controller.js';

export const userRouter = express.Router();

userRouter.get('/users', authMiddleware, catchError(getAllActivated));

userRouter.patch('/me/name', authMiddleware, catchError(updateName));

userRouter.patch(
  '/me/reset-password',
  authMiddleware,
  catchError(updatePassword),
);

userRouter.patch(
  '/me/reset-email',
  authMiddleware,
  catchError(requestEmailChange),
);

userRouter.get('/me/reset-email/:token', catchError(confirmEmailChange));
