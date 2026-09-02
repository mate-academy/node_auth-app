import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import {
  loginSchema,
  passwordResetConfirmSchema,
  passwordResetRequestSchema,
  registerSchema,
} from '../validators/auth.schemas.js';
import {
  registerController,
  activateController,
  loginController,
  refreshController,
  logoutController,
  requestPasswordResetController,
  confirmPasswordResetController,
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.js';

export const authRouter = Router();

authRouter.post('/registration', validate(registerSchema), registerController);
authRouter.get('/activation/:activationToken', activateController);
authRouter.post('/login', validate(loginSchema), loginController);
authRouter.post('/refresh', refreshController);
authRouter.post('/logout', requireAuth, logoutController);

authRouter.post(
  '/password-reset',
  validate(passwordResetRequestSchema),
  requestPasswordResetController,
);

authRouter.post(
  '/password-reset/:token',
  validate(passwordResetConfirmSchema),
  confirmPasswordResetController,
);
