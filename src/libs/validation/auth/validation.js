'use strict';

const { bodyValidation } = require('../../middlewares/middlewares.js');
const { signupSchema } = require('./validation.schemas/signup.schema.js');
const { loginSchema } = require('./validation.schemas/login.schema.js');
const {
  requestResetSchema,
} = require('./validation.schemas/request-reset.schema.js');
const { resetSchema } = require('./validation.schemas/reset.schema.js');

const signupValidation = bodyValidation(signupSchema);
const loginValidation = bodyValidation(loginSchema);
const requestResetValidation = bodyValidation(requestResetSchema);
const resetValidation = bodyValidation(resetSchema);

module.exports = {
  signupValidation,
  loginValidation,
  requestResetValidation,
  resetValidation,
};
