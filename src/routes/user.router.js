import express from 'express';
import { userController } from '../controllers/user.controller.js';
import catchError from '../utils/catchError.js';

const userRouter = new express.Router();

userRouter.get('/', catchError(userController.getAll));
userRouter.get('/:id', catchError(userController.getById));
userRouter.patch('/:id', catchError(userController.updateById));

export default userRouter;
