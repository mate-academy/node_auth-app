'use strict';

const validator = require('validator');

const validateRegistrationInput = (req, res, next) => {
  const { name, email, password } = req.body;

  const errors = {
    email: !validator.isEmail(email) ? 'Invalid email address' : null,
    password: !validator.isLength(password, { min: 6 })
      ? 'Password must be at least 6 characters'
      : null,
    name: !validator.isLength(name, {
      min: 2, max: 20,
    })
      ? 'Name must be between 2 and 20 characters'
      : null,
  };

  const hasErrors = Object.values(errors).some((error) => error !== null);

  if (hasErrors) {
    return res.status(400).send({
      error: 'Bad request', errors,
    });
  }

  next();
};

module.exports = {
  validateRegistrationInput,
};
