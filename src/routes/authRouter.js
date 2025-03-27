import express from 'express';

import { authController } from '../controllers/authController';
import { catchError } from '../middlewares/errorMiddleware';

export const authRouter = new express.Router();

authRouter.post('/register', catchError(authController.register));

authRouter.get(
  '/activation/:activationToken',
  catchError(authController.activate),
);
authRouter.post('/login', catchError(authController.login));
authRouter.post('/logout', catchError(authController.logout));
authRouter.get('/refresh', catchError(authController.refresh));
