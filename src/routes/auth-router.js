import express from 'express';
import { authController } from '../controllers/auth-controller.js';
import { catchError } from '../utils/catch-error.js';

export const authRouter = new express.Router();

authRouter.post('/registration', catchError(authController.register));
authRouter.post('/login', catchError(authController.login));
authRouter.post('/logout', catchError(authController.logout));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.get('/activation/:activationToken', catchError(authController.activate),
);
