import express from 'express';
import { userController } from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../middlewares/catchError.js';

export const userRouter = new express.Router();

userRouter.get('/', catchError(authMiddleware), catchError(userController.getAll));
