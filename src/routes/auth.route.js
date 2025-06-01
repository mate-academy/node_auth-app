import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';

export const router = new express.Router();

router.post('/login', catchError(authController.login));
router.post('/logout', catchError(authController.logout));
router.get('/refresh', catchError(authController.refresh));
router.post('/registration', catchError(authController.registration));
router.get('/activation/:activationToken', catchError(authController.activate));
router.post('/reset-password', catchError(authController.requestPasswordReset));

router.post(
  '/reset-password/:resetToken',
  catchError(authController.confirmPasswordReset),
);

router.post('/google', catchError(authController.googleSignIn));
router.post('/auth/github/callback', catchError(authController.githubSignIn));

export { router as authRouter };
