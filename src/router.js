import express from 'express';
import { authController } from './controller/auth.controller';
import { profileController } from './controller/profile.controller';
import { authenticateUser } from './middleware/authenticateUser';

const authRouter = new express.Router();

authRouter.post('/register', authController.register);

authRouter.get('/verify-email', authController.verifyEmail);

authRouter.post('/login', authController.login);

authRouter.post('/logout', authController.logout);

authRouter.post('/reset-password', authController.resetPassword);
authRouter.post('/confirm-reset-password', authController.confirmResetPassword);

authRouter.get('/profile', authenticateUser, profileController.viewProfile);

authRouter.put('/profile', authenticateUser, profileController.updateProfile);

authRouter.put(
  '/change-password',
  authenticateUser,
  profileController.changePassword,
);

authRouter.put(
  '/change-email',
  authenticateUser,
  profileController.changeEmail,
);

authRouter.all('*', (req, res) => {
  res.status(404).json({ error: 'Page not found' });
});

export default authRouter;