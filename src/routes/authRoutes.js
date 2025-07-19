'use strict';

const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateUser } = require('../middleware/auth');
const { validatePassword } = require('../utils/validation');

const router = express.Router();

// Registration validation
const registerValidation = [
  body('name').isLength({ min: 1 }).withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').custom((value) => {
    const errors = validatePassword(value);

    if (errors.length > 0) {
      throw new Error('Password does not meet requirements');
    }

    return true;
  }),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }

    return true;
  }),
];

// Login validation
const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 1 }).withMessage('Password is required'),
];

// Forgot password validation
const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
];

// Reset password validation
const resetPasswordValidation = [
  body('password').custom((value) => {
    const errors = validatePassword(value);

    if (errors.length > 0) {
      throw new Error('Password does not meet requirements');
    }

    return true;
  }),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }

    return true;
  }),
];

// Routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/logout', authenticateUser, authController.logout);
router.get('/activate/:token', authController.activate);

router.post(
  '/forgot-password',
  forgotPasswordValidation,
  authController.forgotPassword,
);

router.post(
  '/reset-password/:token',
  resetPasswordValidation,
  authController.resetPassword,
);

module.exports = router;
