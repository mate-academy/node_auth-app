import express from 'express';
import {
  register,
  activate,
  login,
  logout,
  passwordResetRequest,
  passwordResetConfirm,
} from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { guestMiddleware } from '../middlewares/guest.middleware.js';

const router = express.Router();

router.post('/register', guestMiddleware, register);

router.post('/login', guestMiddleware, login);

router.get('/activate/:token', guestMiddleware, activate);

router.post('/password-reset/request', guestMiddleware, passwordResetRequest);

router.post('/password-reset/confirm', guestMiddleware, passwordResetConfirm);

router.post('/logout', authMiddleware, logout);

router.get('/me', authMiddleware, (req, res) => {
  res.json(req.user);
});

export default router;
