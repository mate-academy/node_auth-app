'use strict';

const userService = require('../services/userService.js');
const { ApiError } = require('../exceptions/ApiError.js');

async function register(req, res) {
  const { name, email, password } = req.body;

  const emailError = userService.validateEmail(email);
  const passwordError = userService.validatePassword(password);

  if (emailError || passwordError) {
    const errors = {
      email: emailError,
      password: passwordError,
    };

    throw ApiError.BadRequest('Validation error', errors);
  }

  await userService.register({
    name,
    email,
    password,
  });

  res.send({ message: 'User created' });
}

module.exports = {
  authController: {
    register,
  },
};
