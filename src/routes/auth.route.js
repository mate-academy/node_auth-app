import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchErrors.js';

export const authRouter = new express.Router();

authRouter.post('/registration', catchError(authController.register)); // registrate new user
authRouter.get('/activation/:activationToken', catchError(authController.activate)); // confirm email
authRouter.post('/login', catchError(authController.login)); // login user
authRouter.get('/refresh', catchError(authController.refresh)); // login user
