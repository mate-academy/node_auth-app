'use strict';

const { User } = require('../models/user');
const userService = require('../services/user.service');
const jwtService = require('../services/jwt.service.js');
const { ApiError } = require('../exceptions/api.error');
const bcrypt = require('bcrypt');
const tokenService = require('../services/token.service');
const validator = require('../utils/validators');

async function generateToken(res, user) {
  const normalizedUser = userService.normalizeUser(user);
  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    HttpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
}

const register = async(req, res, next) => {
  const { name, email, password } = req.body;

  const errors = {
    email: validator.email(email),
    password: validator.password(password),
    name: validator.username(name),
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

const login = async(req, res) => {
  const { email, password } = req.body;
  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  if (user.activationToken) {
    throw ApiError.badRequest('Activate user, check your email');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  };

  await generateToken(res, user);
};

const refresh = async(req, res) => {
  const { refreshToken } = req.cookies;
  const userData = await jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  };

  const user = await userService.findByEmail(userData.email);

  await generateToken(res, user);
};

const logout = async(req, res) => {
  const { refreshToken } = req.cookies;
  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(userData.id);

  res.sendStatus(204);
};

const reset = async(req, res) => {
  const { email } = req.body;

  await userService.resetPassword(email);

  res.send({ message: 'OK' });
};

const setNewPassword = async(req, res) => {
  const { resetToken } = req.params;
  const { newPassword, confirmation } = req.body;

  const user = await User.findOne({ where: { resetToken } });

  if (!user) {
    res.sendStatus(404);

    return;
  }

  const isValidNewPassword = validator.newPassword(
    user.password,
    newPassword,
    confirmation);

  if (isValidNewPassword) {
    throw ApiError.badRequest('Validation error', { isValidNewPassword });
  }

  const hashedNewPas = await bcrypt.hash(newPassword, 10);

  user.password = hashedNewPas;
  user.resetToken = null;
  user.save();

  res.send(userService.normalizeUser(user));
};

module.exports = {
  register,
  activate,
  login,
  refresh,
  logout,
  reset,
  setNewPassword,
};
