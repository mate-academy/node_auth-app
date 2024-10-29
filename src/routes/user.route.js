import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchErrors.js';

export const userRouter = new express.Router();
// eslint-disable-next-line max-len
userRouter.get('/', authMiddleware, catchError(userController.getAllActivated)); // get secured info (all users)
