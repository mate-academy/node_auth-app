import express from 'express';
import {
  register,
  activateUser,
  login,
  requestPasswordReset,
  resetPassword,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.get('/activate/:token', activateUser);
router.post('/login', login);

router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password/:token', resetPassword);

export default router;
