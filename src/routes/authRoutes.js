const express = require('express');
const router = express.Router();

const {
  register,
  activate,
  login,
  logout,
  requestPasswordReset,
  confirmPasswordReset,
  refreshAccessToken,
} = require('../controllers/authController');

const {
  registerValidation,
  loginValidation,
  resetPasswordValidation,
  confirmResetPasswordValidation,
} = require('../middleware/validation');

const { requireAuth, requireGuest } = require('../middleware/auth');

// Guest only routes
router.post('/register', requireGuest, registerValidation, register);
router.get('/activate/:token', requireGuest, activate);
router.post('/login', requireGuest, loginValidation, login);

router.post(
  '/forgot-password',
  requireGuest,
  resetPasswordValidation,
  requestPasswordReset,
);

router.post(
  '/reset-password/:token',
  requireGuest,
  confirmResetPasswordValidation,
  confirmPasswordReset,
);

// Authenticated only routes
router.post('/logout', requireAuth, logout);

// Public routes
router.post('/refresh-token', refreshAccessToken);

module.exports = router;
