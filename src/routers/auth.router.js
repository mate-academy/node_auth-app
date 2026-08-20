import express from 'express';

import * as authController from '../controllers/auth.controller.js';
import asyncHandler from '../utils/asyncHandler.js';
import validate from '../middlewares/validation.middleware.js';
import {
  registerSchema,
  loginSchema,
  activateSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../schemas/auth.schema.js';

const router = express.Router();

router.post(
  '/registration',
  validate(registerSchema),
  asyncHandler(authController.register),
);

router.post(
  '/sessions',
  validate(loginSchema),
  asyncHandler(authController.login),
);

router.delete('/sessions', asyncHandler(authController.logout));

router.post('/sessions/tokens', asyncHandler(authController.refresh));

router.get(
  '/activations/:token',
  validate(activateSchema),
  asyncHandler(authController.activate),
);

router.post(
  '/password-resets',
  validate(forgotPasswordSchema),
  asyncHandler(authController.forgotPassword),
);

router.post(
  '/password-resets/confirmation/:token',
  validate(resetPasswordSchema),
  asyncHandler(authController.resetPassword),
);

export default router;
