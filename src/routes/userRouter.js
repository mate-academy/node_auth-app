'use strict';

import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';
import userController from '../controllers/userController.js';

export const userRouter = new express.Router();

userRouter.get(
  '/',
  catchError(authMiddleware),
  catchError(userController.getAll)
);
