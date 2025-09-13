import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { isAuth } from '../midlewares/isAuthenticated.js';

export const userRouter = express.Router();

userRouter.get('/', isAuth, userController.getAllUsers);
