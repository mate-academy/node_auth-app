import express from 'express';
import cookieParser from 'cookie-parser';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { authController } from '../controllers/auth.controller.js';
import catchError from '../utils/catchError.js';

const authRouter = new express.Router();

authRouter.post('/registration', catchError(authController.registration));

authRouter.post(
  '/forgot-password-request',
  catchError(authController.forgotPasswordRequest),
);

authRouter.post('/reset-password', catchError(authController.resetPassword));

authRouter.get(
  '/activation/:activationToken',
  catchError(authController.activation),
);

authRouter.post('/login', catchError(authController.login));

authRouter.get('/refresh', cookieParser(), catchError(authController.refresh));

authRouter.post(
  '/logout',
  cookieParser(),
  authMiddleware,
  catchError(authController.logout),
);

export default authRouter;
