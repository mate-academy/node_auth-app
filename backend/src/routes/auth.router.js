import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';
import { errorMiddleware } from '../middlewares/errorMiddleware.js';

export const authRouter = new express.Router();

authRouter.post('/register', catchError(authController.register));
authRouter.get(
  '/activate/:activationToken',
  catchError(authController.activate),
);
authRouter.post('/login', catchError(authController.login));
authRouter.get('/me', catchError(authController.getMe));
