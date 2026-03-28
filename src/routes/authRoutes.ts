import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { guestMiddleware } from '../middlewares/guestMiddleware.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export const authRouter = Router();

authRouter.get('/register', guestMiddleware, authController.renderRegister);
authRouter.get('/login', guestMiddleware, authController.renderLogin);

authRouter.get(
  '/reset-password',
  guestMiddleware,
  authController.renderResetPasswordRequest,
);

authRouter.get(
  '/activation/:email/:activationToken',
  guestMiddleware,
  authController.activate,
);

authRouter.get(
  '/reset-password/:email/:resetPasswordToken',
  guestMiddleware,
  authController.renderResetPasswordConfirm,
);

authRouter.post('/register', guestMiddleware, authController.register);
authRouter.post('/login', guestMiddleware, authController.login);

authRouter.post(
  '/reset-password',
  guestMiddleware,
  authController.resetPasswordRequest,
);

authRouter.post('/logout', authMiddleware, authController.logout);

authRouter.post(
  '/reset-password/confirm',
  guestMiddleware,
  authController.resetPasswordConfirm,
);
