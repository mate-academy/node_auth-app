import express from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authMiddleware } from '../moddlewares/auth.middleware.js';

export const userRouter = new express.Router();

userRouter.get('/', authMiddleware, UserController.getAllActivated);
