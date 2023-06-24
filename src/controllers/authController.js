'use strict';

const userService = require('../services/userService.js');
const { ApiError } = require('../exceptions/ApiError.js');

async function register(req, res) {
  const { name, email, password } = req.body;

  const errors = {
    email: userService.validateEmail(email),
    password: userService.validatePassword(password),
  };

  if (Object.values(errors).some((error) => error)) {
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
