import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { catchError } from '../utils/catchError.utils.js';

export const userRouter = new express.Router();

userRouter.get('/', catchError(userController.getAllActivated));
userRouter.patch('/name', catchError(userController.changeName));
userRouter.patch('/password', catchError(userController.changePassword));
userRouter.patch('/email', catchError(userController.changeEmail));

