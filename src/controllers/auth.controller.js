'use strict';

const { ApiError } = require('../exeptions/api.error');

const { User } = require('../models/User');
const { randomUUID } = require('crypto');
const bcrypt = require('bcrypt');
const { sendResetPassword } = require('../services/email.service');
const { sing, singRefresh, verifyRefresh } = require('../services/jwt.service');
const { remove, save, getByToken } = require('../services/tokenService');
const { normalize, findByEmail } = require('../services/user.service');
const { validateName, validateEmail, validatePassword }
  = require('../utils/validationFunction');

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password || errors.name) {
    throw ApiError.BadRequest('Validation error', errors)
  }

  await register({name, email, password });

  res.send({ message: 'OK' });

}

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await User.findOne({ where: { activationToken }});

  if (!user) {
    res.sendStatus(404);

    return;
  }

  user.activationToken = null;
  user.save();

  res.send(user);
}

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const isPasswordValid = bcrypt.compare(password, user.password);

  if(!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  sendAuthentication(res, user);
}

const refresh = async (req, res, next) => {
  const { refreshToken } = req.cookies;
  const userData = verifyRefresh(refreshToken);

  if (!userData) {
    throw ApiError.unauthorized();
  }

  const token = await getByToken(refreshToken);

  if (!token) {
    throw ApiError.unauthorized();
  }

  const user = await findByEmail(userData.email);

  await sendAuthentication(res, user);
}

async function sendAuthentication(res, user) {
  const userData = normalize(user);
  const accessToken = sing(userData);
  const refreshToken = singRefresh(userData);

  await save(user.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.send({
    user: userData,
    accessToken,
  });
}

async function logout(req, res, next) {
  const { refreshToken } = req.cookies;
  const userData = verifyRefresh(refreshToken);

  res.clearCookie('refreshToken');

  if (userData) {
    await remove(userData.id);
  }

  res.sendStatus(204);
}

async function resetPassword(req, res) {
  const { email } = req.body;

  if (!email) {
    throw ApiError.BadRequest('Email is required');
  }

  const user = await findByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('User with this email does not exist');
  }

  const token = await save(user.id, randomUUID());

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

  const resetPasswordToken = await getByToken(resetToken);

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
  resetPassword,
  resetPasswordConfirm,
};
