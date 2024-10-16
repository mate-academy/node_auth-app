import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';

export const authRouter = Router();

authRouter.post('/register', catchError(authController.registerUser));
authRouter.post('/login', catchError(authController.loginUser));
authRouter.post('/logout', catchError(authController.logoutUser));
authRouter.get('/refresh', catchError(authController.refresh));

authRouter.get(
  '/activate/:activationToken',
  catchError(authController.activateUser),
);
