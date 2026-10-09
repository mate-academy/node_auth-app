const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {
  validateRegister,
  validateLogin,
} = require('../middleware/validateMiddleware');

// Import both auth middlewares here!
const {
  isAuthenticated,
  isNotAuthenticated,
} = require('../middleware/authMiddleware');

// --- Public Routes (Blocked if ALREADY logged in) ---
router.post(
  '/register',
  isNotAuthenticated,
  validateRegister,
  authController.register,
);
router.post('/login', isNotAuthenticated, validateLogin, authController.login);

router.post(
  '/forgot-password',
  isNotAuthenticated,
  authController.forgotPassword,
);

router.post(
  '/reset-password/:token',
  isNotAuthenticated,
  authController.resetPassword,
);

// --- Authenticated Routes (Blocked if NOT logged in) ---
router.post('/logout', isAuthenticated, authController.logout);

// --- Token Activation Route (Accessible by anyone with the link) ---
router.get('/activate/:token', authController.activate);

module.exports = router;
