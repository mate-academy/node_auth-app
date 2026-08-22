import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { catchError } from '../utils/catchError.js';

export const authRouter = new express.Router();

authRouter.post('/register', catchError(authController.register));
authRouter.get('/activate', catchError(authController.activate));
authRouter.post('/login', catchError(authController.login));
authRouter.get(
  '/profile',
  authMiddleware,
  catchError(authController.getProfile),
);
authRouter.get('/refresh', catchError(authController.refresh));
