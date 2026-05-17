'use strict';

import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { guestMiddleware } from '../middlewares/guest.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const authRouter = express.Router();

authRouter.post('/register', guestMiddleware, authController.register);
authRouter.get('/activate/:token', guestMiddleware, authController.activate);
authRouter.post('/login', guestMiddleware, authController.login);
authRouter.post('/logout', authMiddleware, authController.logout);

authRouter.post(
  '/reset-password',
  guestMiddleware,
  authController.requestPasswordReset,
);

authRouter.post(
  '/reset-password/:token',
  guestMiddleware,
  authController.confirmPasswordReset,
);

authRouter.get(
  '/confirm-email/:token',
  guestMiddleware,
  authController.confirmEmailChange,
);

export default authRouter;
