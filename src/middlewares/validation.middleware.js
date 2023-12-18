'use strict';

const { validators } = require('../utils/validators.js');
const { ApiError } = require('../utils/api.error.js');

const reqBodyValidation = (req, res, next) => {
  const { email, password } = req.body;

  const passwordError = validators.validatePassword(password);
  const emailError = validators.validateEmail(email);

  if (passwordError || emailError) {
    throw ApiError.BadRequest('Provide all necessary data for registration', {
      password: passwordError,
      email: emailError,
    });
  }

  next();
};

const additionalValidation = (req, res, next) => {
  const { name } = req.body;

  const nameError = validators.validateName(name);

  if (nameError) {
    throw ApiError.BadRequest('Provide all necessary data for registration', {
      name: nameError,
    });
  }

  next();
};

exports.reqBodyValidation = reqBodyValidation;
exports.additionalValidation = additionalValidation;
