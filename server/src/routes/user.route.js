import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddlewares } from '../middlewares/authMiddlewares.js';
import { catchError } from '../utils/catchError.js';

export const userRoute = express.Router();

userRoute.get('/', authMiddlewares, catchError(userController.getAllActivated));
