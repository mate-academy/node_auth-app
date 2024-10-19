import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

export const userRoute = new express.Router();

userRoute.get('/', authMiddleware, userController.getAllUsers);
