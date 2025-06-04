const { body, validationResult } = require('express-validator');
const { validatePassword } = require('../utils/password');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),

  body('password').custom((value) => {
    const validation = validatePassword(value);

    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    return true;
  }),

  handleValidationErrors,
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),

  body('password').notEmpty().withMessage('Password is required'),

  handleValidationErrors,
];

const resetPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),

  handleValidationErrors,
];

const confirmResetPasswordValidation = [
  body('password').custom((value) => {
    const validation = validatePassword(value);

    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    return true;
  }),

  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }

    return true;
  }),

  handleValidationErrors,
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  handleValidationErrors,
];

const changePasswordValidation = [
  body('oldPassword').notEmpty().withMessage('Current password is required'),

  body('newPassword').custom((value) => {
    const validation = validatePassword(value);

    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    return true;
  }),

  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Passwords do not match');
    }

    return true;
  }),

  handleValidationErrors,
];

const changeEmailValidation = [
  body('password').notEmpty().withMessage('Password is required'),

  body('newEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),

  handleValidationErrors,
];

module.exports = {
  registerValidation,
  loginValidation,
  resetPasswordValidation,
  confirmResetPasswordValidation,
  updateProfileValidation,
  changePasswordValidation,
  changeEmailValidation,
};
