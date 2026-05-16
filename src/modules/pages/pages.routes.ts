import { Router } from 'express';
import { pagesController } from './pages.controller.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

export const pagesRoutes = Router();

pagesRoutes.get('/register', pagesController.showRegister);
pagesRoutes.post('/register', asyncHandler(pagesController.register));

pagesRoutes.get('/login', pagesController.showLogin);
pagesRoutes.post('/login', asyncHandler(pagesController.login));

pagesRoutes.get('/activate/:token', asyncHandler(pagesController.activate));

pagesRoutes.post('/logout', authMiddleware, pagesController.logout);

pagesRoutes.get('/forgot-password', pagesController.showForgotPassword);
pagesRoutes.post(
  '/forgot-password',
  asyncHandler(pagesController.forgotPassword),
);

pagesRoutes.get('/email-sent', pagesController.showEmailSent);

pagesRoutes.get('/reset-password/:token', pagesController.showResetPassword);
pagesRoutes.post(
  '/reset-password/:token',
  asyncHandler(pagesController.resetPassword),
);

pagesRoutes.get(
  '/reset-password-success',
  pagesController.showResetPasswordSuccess,
);

pagesRoutes.get(
  '/profile',
  authMiddleware,
  asyncHandler(pagesController.showProfile),
);

pagesRoutes.post(
  '/profile/name',
  authMiddleware,
  asyncHandler(pagesController.updateName),
);

pagesRoutes.post(
  '/profile/password',
  authMiddleware,
  asyncHandler(pagesController.changePassword),
);

pagesRoutes.post(
  '/profile/email',
  authMiddleware,
  asyncHandler(pagesController.changeEmail),
);

pagesRoutes.get(
  '/profile/email/confirm/:token',
  asyncHandler(pagesController.confirmEmailChange),
);
