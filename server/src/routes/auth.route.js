import express from 'express';
import { authControllers } from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';

export const authRoute = express.Router();

authRoute.post('/registration', catchError(authControllers.register));

authRoute.get(
  '/activation/:activationToken',
  catchError(authControllers.activate),
);

authRoute.post('/login', catchError(authControllers.login));
authRoute.get('/refresh', catchError(authControllers.refresh));
authRoute.post('/logout', catchError(authControllers.logout));
authRoute.post('/reset', catchError(authControllers.reset));
