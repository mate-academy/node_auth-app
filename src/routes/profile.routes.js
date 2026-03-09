import express from 'express';
import {
  getProfile,
  changeName,
  changePassword,
  changeEmail,
  confirmNewEmail,
} from '../controllers/profile.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/profile', authMiddleware, getProfile);

router.patch('/profile/name', authMiddleware, changeName);
router.patch('/profile/password', authMiddleware, changePassword);
router.patch('/profile/email', authMiddleware, changeEmail);

router.get('/profile/confirm-email/:token', confirmNewEmail);

export default router;
