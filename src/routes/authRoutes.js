import express from 'express';
import {
  register,
  activate,
  login,
  logout,
  requestPasswordReset,
  resetPasswordConfirm,
} from '../controllers/authController.js';

export const router = express.Router();

router.post('/register', register);
router.post('/activate', activate);
router.post('/login', login);
router.post('/logout', logout);
router.get('/activate/:token', activate);
router.post('/reset-password', requestPasswordReset);
router.post('/reset-password/confirm', resetPasswordConfirm);

export default router;
