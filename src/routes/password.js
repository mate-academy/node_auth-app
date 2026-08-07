'use strict';

const { Router } = require('express');

const passwordController = require('../controllers/passwordController');
const validate = require('../middleware/validate');
const {
  forgotValidator,
  resetValidator,
} = require('../validators/passwordValidators');

const passwordRouter = Router();

passwordRouter.post(
  '/forgot',
  forgotValidator,
  validate,
  passwordController.forgotPassword,
);

passwordRouter.post(
  '/reset/:token',
  resetValidator,
  validate,
  passwordController.resetPassword,
);

module.exports = passwordRouter;
