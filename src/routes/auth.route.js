import express from 'express';
import { authController } from '../controllers/auth.controllers.js';
import { catchError } from '../utils/cathcError.js';

export const authrouter = new express.Router();

authrouter.post('/registration', catchError(authController.register));

authrouter.get(
  '/activation/:activationToken',
  catchError(authController.activate),
);
authrouter.post('/login', catchError(authController.login));
authrouter.get('/refresh', catchError(authController.refresh));
authrouter.get('/logout', catchError(authController.logout));
