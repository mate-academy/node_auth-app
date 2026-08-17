import express from 'express';

import {
  register,
  login,
  logout,
  activate,
  forgotPassword,
  resetPassword,
  refresh,
  changeName,
  changePassword,
  changeEmail,
  confirmEmailChange,
  getMe,
} from '../controllers/authController.js';

import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middlewares/validate.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

import {
  changeEmailSchema,
  changeNameSchema,
  changePasswordSchema,
  emptyRequestSchema,
  forgotPasswordSchema,
  loginSchema,
  logoutSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
  tokenSchema,
} from '../validation/authSchemas.js';

const router = express.Router();

router.post('/register', validate(registerSchema), asyncHandler(register));

router.post('/login', validate(loginSchema), asyncHandler(login));

router.post('/logout', validate(logoutSchema), asyncHandler(logout));

router.get('/activate/:token', validate(tokenSchema), asyncHandler(activate));

router.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  asyncHandler(forgotPassword),
);

router.post(
  '/reset-password/:token',
  validate(resetPasswordSchema),
  asyncHandler(resetPassword),
);

router.post('/refresh', validate(refreshSchema), asyncHandler(refresh));

router.get(
  '/me',
  authMiddleware,
  validate(emptyRequestSchema),
  asyncHandler(getMe),
);

router.patch(
  '/me/name',
  authMiddleware,
  validate(changeNameSchema),
  asyncHandler(changeName),
);

router.patch(
  '/me/password',
  authMiddleware,
  validate(changePasswordSchema),
  asyncHandler(changePassword),
);

router.patch(
  '/me/email',
  authMiddleware,
  validate(changeEmailSchema),
  asyncHandler(changeEmail),
);

router.get(
  '/change-email/:token',
  validate(tokenSchema),
  asyncHandler(confirmEmailChange),
);

export default router;
