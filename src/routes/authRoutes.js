const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {
  validateRegister,
  validateLogin,
} = require('../middleware/validateMiddleware');

// --- Public Routes (Non-authenticated) ---

// Register
router.post('/register', validateRegister, authController.register);

// Activate Account (User clicks link in email)
router.get('/activate/:token', authController.activate);

// Login
router.post('/login', validateLogin, authController.login);

// Logout
router.post('/logout', authController.logout);

// Password Reset
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;
