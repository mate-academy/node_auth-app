'use strict';

const userService = require('../services/user.service');
const jwtService = require('../services/jwt.service');
const tokenService = require('../services/token.service');
const { ApiError } = require('../exceptions/ApiError');

require('dotenv').config();

const sendAuthData = async(res, user) => {
  const normalizedUser = userService.normalize(user);
  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save({
    userId: normalizedUser.id,
    token: refreshToken,
    type: 'refreshToken',
  });

  res.cookie('refreshToken', refreshToken,
    {
      maxAge: 10 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    },
  );

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

const refresh = async(req, res) => {
  const { refreshToken } = req.cookies;
  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData) {
    throw ApiError.Unauthorized();
  }

  const token = await tokenService.getByUserId(userData.id);

  if (!token) {
    throw ApiError.Unauthorized();
  }

  const user = await userService.getById(userData.id);

  await sendAuthData(res, user);
};

const register = async(req, res) => {
  const { username, email, password } = req.body;

  await userService.register({
    username, email, password,
  });

  res.sendStatus(204);
};

const activate = async(req, res) => {
  const { token, id } = req.query;

  await userService.activate({
    token, id,
  });

  const user = userService.getById(id);

  await sendAuthData(res, user);
};

const login = async(req, res) => {
  const { email, password } = req.body;

  await userService.login({
    email, password,
  });

  const user = userService.getByEmail(email);

  await sendAuthData(res, user);
};

const requestEmailConfirmation = async(req, res) => {
  const { email } = req.body;

  await userService.requestForReset(email);

  res.sendStatus(204);
};

const confirmReset = async(req, res) => {
  const { token, id } = req.query;

  await userService.confirmForReset({
    token, id,
  });

  const user = await userService.getById(id);

  res.send(userService.normalize(user));
};

const resetPassword = async(req, res) => {
  const { email, newPassword } = req.body;

  await userService.changePassword(email, newPassword);

  res.sendStatus(204);
};

const logout = async(req, res) => {
  const { refreshToken } = req.cookies;
  const userData = jwtService.validateRefreshToken(refreshToken);

  res.clearCookie('refreshToken');

  if (userData) {
    await tokenService.removeAll({ userId: userData.id });
  }

  res.sendStatus(204);
};

module.exports = {
  register,
  activate,
  login,
  requestEmailConfirmation,
  confirmReset,
  resetPassword,
  refresh,
  logout,
};
