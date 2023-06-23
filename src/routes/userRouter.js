import express from 'express';
import { userController } from '../controllers/userConroller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';

export const userRouter = new express.Router();

userRouter.get(
  '/', catchError(authMiddleware), catchError(userController.getAll)
);
