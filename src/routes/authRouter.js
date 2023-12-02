import express from 'express';
import { catchError } from '../middlewares/catchError.js';
import { authController } from '../controllers/authController.js';

export const authRouter = new express.Router();

authRouter.post('/registration', catchError(authController.registration));
authRouter.post('/login', catchError(authController.login));
authRouter.post('/logout', catchError(authController.logout));
authRouter.post('/reset', catchError(authController.resetPassword));
authRouter.get('/refresh', catchError(authController.refresh));

authRouter.post(
  '/confirm/:confirmEmailToken',
  catchError(authController.confirmPassword)
);

authRouter.get(
  '/activate/:confirmEmailToken',
  catchError(authController.activate)
);
