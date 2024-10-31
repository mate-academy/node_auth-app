import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { checkRequiredFields } from '../middlewares/checkRequiredFields.js';
import { catchError } from '../utils/catchError.js';

export const authRouter = new express.Router();

authRouter.post('/registration', authController.register);
authRouter.get('/activation/:activationToken', catchError(authController.activate));
authRouter.post('/login', checkRequiredFields(['email', 'password']), catchError(authController.login));
