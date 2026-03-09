'use strict';

const router = require('express').Router();

const {
  register,
  activate,
  login,
  profile,
  logout,
  requestPasswordReset,
  resetPassword,
  updateProfileName,
  updateProfilePassword,
  updateProfileEmail,
} = require('../controllers/auth.controller');

const authMiddleware = require('../middleware/auth_middleware');

router.post('/register', register);

router.get('/activate/:token', activate);

router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.post('/reset-password', requestPasswordReset);
router.post('/reset/:token', resetPassword);

router.get('/profile', authMiddleware, profile);
router.patch('/profile/name', authMiddleware, updateProfileName);
router.patch('/profile/password', authMiddleware, updateProfilePassword);
router.patch('/profile/email', authMiddleware, updateProfileEmail);

module.exports = router;
