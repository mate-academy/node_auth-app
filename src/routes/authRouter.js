import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { isAuth } from '../midlewares/isAuthenticated.js';
import { isNotAuth } from '../midlewares/isNotAuthenticated.js';

export const authRouter = express.Router();

authRouter.post('/registration', isNotAuth, authController.register);
authRouter.get('/activate', isNotAuth, authController.activate);
authRouter.post('/login', isNotAuth, authController.login);
authRouter.get('/refresh', isNotAuth, authController.refresh);
authRouter.get('/logout', isAuth, authController.logout);

authRouter.post(
  '/reset-password',
  isNotAuth,
  authController.requestResetPassword,
);

authRouter.post(
  '/reset-password/confirm',
  isNotAuth,
  authController.resetPassword,
);
