'use strict';

const express = require('express');
const { body } = require('express-validator');
const profileController = require('../controllers/profileController');
const { authenticateUser } = require('../middleware/auth');
const { validatePassword } = require('../utils/validation');

const router = express.Router();

// Profile validation
const updateNameValidation = [
  body('name').isLength({ min: 1 }).withMessage('Name is required'),
];

const changePasswordValidation = [
  body('oldPassword')
    .isLength({ min: 1 })
    .withMessage('Current password is required'),
  body('newPassword').custom((value) => {
    const errors = validatePassword(value);

    if (errors.length > 0) {
      throw new Error('New password does not meet requirements');
    }

    return true;
  }),
  body('confirmNewPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('New passwords do not match');
    }

    return true;
  }),
];

const changeEmailValidation = [
  body('password').isLength({ min: 1 }).withMessage('Password is required'),
  body('newEmail').isEmail().withMessage('Please enter a valid email'),
];

// All profile routes require authentication
router.use(authenticateUser);

// Routes
router.get('/', profileController.getProfile);
router.put('/name', updateNameValidation, profileController.updateName);

router.put(
  '/password',
  changePasswordValidation,
  profileController.changePassword,
);
router.put('/email', changeEmailValidation, profileController.changeEmail);

module.exports = router;
