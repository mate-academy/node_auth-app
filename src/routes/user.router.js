import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';

export const userRouter = new express.Router();

userRouter.get(
  '/',
  catchError(authMiddleware),
  catchError(userController.getAllActivated),
);

userRouter.post('/changeName', catchError(userController.changeName));
userRouter.post('/changePassword', catchError(userController.changePassword));
userRouter.post('/changeEmail', catchError(userController.changeEmail));
userRouter.get('/changeEmail/:email', catchError(userController.activeEmail));
