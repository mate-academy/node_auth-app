'use strict';

const { ApiError } = require('../exceptions/ApiError');
const userService = require('../services/user.service');
const jwtService = require('../services/jwt.service');
const tokenService = require('../services/token.service');
const { User } = require('../models/user.model');
const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');
const { sendResetPassword } = require('../services/email.service');
const refreshPasswordService
= require('../services/refreshPasswordToken.service');

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
}

function validateName(value) {
  if (!value) {
    return 'Name is required';
  }
}

async function register(req, res) {
  const { name, email, password } = req.body;

  const errors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password || errors.name) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  await userService.register({
    name, email, password,
  });

  res.status(201).send({ message: 'OK' }, 201);
}

async function activate(req, res) {
  const { activationToken } = req.params;

  const user = await User.findOne({
    where: { activationToken },
  });

  if (!user) {
    res.sendStatus(404);

    return;
  }

  user.activationToken = null;
  await user.save();

  await sendAuthentication(res, user);
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('User with this email does not exist');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Password is wrong');
  }

  await sendAuthentication(res, user);
}

async function refresh(req, res) {
  const { refreshToken } = req.body;
  const userData = jwtService.validateRefreshToken(refreshToken);

  if (!userData) {
    throw ApiError.Unauthorized();
  }

  const token = await tokenService.getByToken(refreshToken);

  if (!token) {
    throw ApiError.Unauthorized();
  }

  const user = await userService.getByEmail(userData.email);

  await sendAuthentication(res, user);
}

async function logout(req, res) {
  const { refreshToken } = req.body;
  const userData = jwtService.validateRefreshToken(refreshToken);

  if (userData) {
    await tokenService.remove(userData.id);
  }

  res.sendStatus(204);
}

async function sendAuthentication(res, user) {
  const userData = userService.normalize(user);
  const accessToken = jwtService.generateAccessToken(userData);
  const refreshToken = jwtService.generateRefreshToken(userData);

  await tokenService.save(user.id, refreshToken);

  res.send({
    user: userData,
    accessToken,
    refreshToken,
  });
}

async function resetPassword(req, res) {
  const { email } = req.body;

  if (!email) {
    throw ApiError.BadRequest('Email is required');
  }

  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('User with this email does not exist');
  }

  const token = await refreshPasswordService.save(user.id, randomUUID());

  await sendResetPassword(email, token.refreshPasswordToken);

  res.sendStatus(204);
}

async function resetPasswordConfirm(req, res) {
  const { resetToken, newPassword } = req.body;

  const errors = {
    newPassword: validatePassword(newPassword),
    resetToken: !resetToken ? 'resetToken is required' : null,
  };

  if (errors.resetToken || errors.newPassword) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  const resetPasswordToken = await refreshPasswordService
    .getByToken(resetToken);

  if (!resetPasswordToken) {
    throw ApiError.BadRequest('resetToken is invalid');
  }

  const user = await User.findOne({
    where: { id: resetPasswordToken.userId },
  });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  await resetPasswordToken.destroy();

  res.sendStatus(204);
}

module.exports = {
  register,
  activate,
  login,
  refresh,
  logout,
  validatePassword,
  validateEmail,
  resetPassword,
  resetPasswordConfirm,
};
