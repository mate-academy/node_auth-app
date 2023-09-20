import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { catchError } from '../utils/catchError.js';

export const authRouter = new Router();

authRouter.post('/registration', catchError(authController.register));

authRouter.get(
  '/activation/:activationToken',
  catchError(authController.activate)
);
authRouter.post('/login', catchError(authController.login));
authRouter.post('/refresh', catchError(authController.refresh));
authRouter.post('/logout', catchError(authController.logout));
authRouter.post('/reset', catchError(authController.reset));
