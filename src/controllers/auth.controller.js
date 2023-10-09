'use strict';

const { User } = require('../models/user');
const { userService } = require('../services/user.service');
// const jwtService = require('../services/jwt.service.js');
const { ApiError } = require('../exceptions/api.error');
// const tokenService = require('../services/token.service.js');

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
}

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
};

function validateUsername(value) {
  if (!value) {
    return 'Name is required';
  }

  if (value.length < 3) {
    return 'At least 3 characters';
  }
}

const register = async(req, res, next) => {
  const { name, email, password } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
    name: validateUsername(name),
  };

  if (errors.email || errors.password || errors.name) {
    throw ApiError.badRequest('Validation error', errors);
  }

  await userService.registration({
    name, email, password,
  });
  res.send({ message: 'OK' });
};

const activate = async(req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    res.sendStatus(404);

    return;
  }

  user.activationToken = null;
  user.save();

  res.send(user);
};

const authController = {
  register,
  activate,
};

module.exports = {
  authController,
};
