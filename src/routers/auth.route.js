import { Router } from 'express';

import * as authController from '../controllers/auth.controller.js';
import * as authValidator from '../validators/auth.validator.js';

import authMiddleware from '../middlewares/authMiddleware.js';
import catchError from '../utils/catchError.js';

const router = Router();

router.post('/login', authValidator.login, catchError(authController.login));

router.post(
  '/register',
  authValidator.register,
  catchError(authController.register),
);

router.get(
  '/activate/:activationToken',
  authValidator.activate,
  catchError(authController.activate),
);

router.post(
  '/reset-password',
  authValidator.resetPassword,
  catchError(authController.resetPassword),
);

router.patch(
  '/password/:resetPasswordToken',
  authValidator.setNewPassword,
  catchError(authController.setPassword),
);

router.post('/logout', authMiddleware, catchError(authController.logout));
router.post('/refresh', catchError(authController.refresh));

export default router;
