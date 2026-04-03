import { Router } from 'express';
import {
  activate,
  forgotPassword,
  login,
  register,
  resetPassword,
  updateEmail,
  updateName,
  updatePassword,
} from '../controllers/authController';
import { authMiddleware } from '../middlewars/authMiddleware';

const router = Router();

router.post('/register', register);

router.get('/activate/:token', activate);

router.post('/login', login);

router.post('/forgot-password', forgotPassword);

router.post('/reset-password', resetPassword);

router.post('/logout', authMiddleware, (req, res) => {
  res.json({ message: 'Logout successful. Redirecting to login...' });
});

router.patch('/update-name', authMiddleware, updateName);

router.patch('/update-password', authMiddleware, updatePassword);

router.patch('/update-email', authMiddleware, updateEmail);

router.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

router.get('/profile', authMiddleware, (req, res) => {
  const user = req.user;

  res.json({
    message: 'Welcome to your profile!',
    user,
  });
});

export default router;
