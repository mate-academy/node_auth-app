'use strict';

const bcrypt = require('bcrypt');
const { ApiError } = require('../exceptions/ApiError');
const jwtService = require('../services/jwtService');
const userService = require('../services/userService');
const validation = require('../utils/validation');

async function updateName(req, res) {
  const { refreshToken } = req.cookies;
  const userData = jwtService.validateRefreshToken(refreshToken);

  if (!userData) {
    throw ApiError.Unauthorized();
  }

  const { name } = req.body;

  if (!name) {
    throw ApiError.BadRequest('No name to change');
  }

  const updatedUser = await userService.updateName(userData.id, name);

  res.send(updatedUser);
}

async function updateEmail(req, res) {
  const { refreshToken } = req.cookies;
  const userData = jwtService.validateRefreshToken(refreshToken);

  if (!userData) {
    throw ApiError.Unauthorized();
  }

  const { email, password } = req.body;

  if (!email || !password || !validation.email(email)) {
    throw ApiError.BadRequest('Bad params to change email');
  }

  const user = await userService.getByEmail(userData.email);

  if (!user) {
    throw ApiError.NotFound();
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Bad password');
  }

  await userService.updateEmail(userData.id, email);

  res.clearCookie('refreshToken');
  res.send({ message: 'Email updated, confirm your new email' });
}

async function updatePassword(req, res) {
  const { refreshToken } = req.cookies;
  const userData = jwtService.validateRefreshToken(refreshToken);

  if (!userData) {
    throw ApiError.Unauthorized();
  }

  const { password, newPassword } = req.body;

  if (!password || !newPassword) {
    throw ApiError.BadRequest('Bad params to change password');
  }

  const user = await userService.getByEmail(userData.email);

  if (!user) {
    throw ApiError.NotFound();
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Bad password');
  }

  if (!validation.password(newPassword)) {
    throw ApiError.BadRequest('New password not valid');
  }

  await userService.updatePassword(userData.id, newPassword);

  res.clearCookie('refreshToken');
  res.send({ message: 'Password updated, login please' });
}

const userController = {
  updateName,
  updateEmail,
  updatePassword,
};

module.exports = userController;
