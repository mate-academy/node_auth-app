import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export const authRouter = express.Router();

authRouter.post('/registration', catchError(authController.register));
authRouter.post('/login', catchError(authController.login));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.get('/logout', authMiddleware, catchError(authController.logout));

authRouter.get(
  '/activation/:email/:activationToken',
  catchError(authController.activate),
);

authRouter.patch(
  '/passChange',
  authMiddleware,
  catchError(authController.changePassword),
);

authRouter.get(
  '/confirmPassChange/:email/:passwordChangeToken',
  catchError(authController.confirmPasswordChange),
);

authRouter.patch(
  '/nameChange',
  authMiddleware,
  catchError(authController.changeName),
);

authRouter.patch(
  '/emailChange',
  authMiddleware,
  catchError(authController.changeEmail),
);

authRouter.get(
  '/confirmEmailChange/:email/:emailChangeToken',
  catchError(authController.confirmEmailChange),
);
