import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddlewares } from '../middlewares/authMiddlewares.js';
import { catchError } from '../utils/catchError.js';

export const userRoute = express.Router();

userRoute.get('/', authMiddlewares, catchError(userController.getAllActivated));

userRoute.patch(
  '/change-name',
  authMiddlewares,
  catchError(userController.changeName),
);

userRoute.patch(
  '/change-password',
  authMiddlewares,
  catchError(userController.changePassword),
);
