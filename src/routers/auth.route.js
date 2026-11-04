import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import * as passwordController from '../controllers/password.controller.js';
import * as profileController from '../controllers/profile.controller.js';
import * as tokenController from '../controllers/token.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { guestMiddleware } from '../middleware/guest.middleware.js';

const authRouter = express.Router();

authRouter.post('/registration', guestMiddleware, authController.register);
authRouter.post('/login', guestMiddleware, authController.login);

authRouter.post(
  '/reset-password',
  guestMiddleware,
  passwordController.requestPasswordReset,
);
authRouter.patch('/reset', guestMiddleware, passwordController.resetPassword);

authRouter.get('/activate/:activationToken', authController.activate);

authRouter.get(
  '/email/confirm/:changeToken',
  profileController.confirmEmailChange,
);

authRouter.post('/refresh', tokenController.refreshAccessToken);
authRouter.post('/logout', authController.logout);

authRouter.get('/profile', authMiddleware, profileController.loadProfile);
authRouter.patch('/profile/name', authMiddleware, profileController.changeName);

authRouter.patch(
  '/profile/password',
  authMiddleware,
  profileController.changePassword,
);

authRouter.patch(
  '/profile/email',
  authMiddleware,
  profileController.changeEmail,
);

export default authRouter;
