'use strict';

const userService = require('../services/user.service');
const jwtService = require('../services/jwt.service');
const tokenService = require('../services/token.service');
const accountService = require('../services/account.service');
const { ApiError } = require('../exceptions/ApiError');
const {
  validateUsername,
  validateEmail,
  validatePassword,
} = require('../utils/validation');

require('dotenv').config();

const sendAuthData = async(res, user) => {
  const normalizedUser = await userService.normalize(user);
  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save({
    userId: normalizedUser.id,
    token: refreshToken,
    type: 'refreshToken',
  });

  res.cookie('refreshToken', refreshToken,
    {
      maxAge: 10 * 24 * 60 * 60 * 1000,
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
  const isRequestValid = validateUsername(username)
    && validateEmail(email)
    && validatePassword(password);

  if (!isRequestValid) {
    throw ApiError.BadRequest('Invalid request');
  }

  await userService.register({
    username, email, password,
  });

  res.sendStatus(204);
};

const activate = async(req, res) => {
  const { token, id } = req.query;

  if (!token || !id) {
    throw ApiError.BadRequest('Invalid request parameters');
  }

  await userService.activate({
    token, id,
  });

  const user = await userService.getById(id);

  req.session.userId = user.id;
  await sendAuthData(res, user);
};

const login = async(req, res) => {
  const { email, password } = req.body;
  const isRequestValid = validateEmail(email)
    && validatePassword(password);

  if (!isRequestValid) {
    throw ApiError.BadRequest('Invalid request');
  }

  await userService.login({
    email, password,
  });

  const user = await userService.getByEmail(email);

  req.session.userId = user.id;
  await sendAuthData(res, user);
};

const requestPasswordReset = async(req, res) => {
  const { email } = req.body;
  const isRequestValid = validateEmail(email);

  if (!isRequestValid) {
    throw ApiError.BadRequest('Invalid request');
  }

  await userService.requestForReset(email);

  res.sendStatus(204);
};

const confirmPasswordReset = async(req, res) => {
  const { token, id } = req.query;

  if (!token || !id) {
    throw ApiError.BadRequest('Invalid request parameters');
  }

  await userService.confirmForReset({
    token, id,
  });

  const user = await userService.getById(id);

  res.send({ email: user.email });
};

const resetPassword = async(req, res) => {
  const { email, newPassword } = req.body;
  const isRequestValid = validateEmail(email)
    && validatePassword(newPassword);

  if (!isRequestValid) {
    throw ApiError.BadRequest('Invalid request');
  }

  await userService.resetPassword({
    email, newPassword,
  });

  res.sendStatus(204);
};

const confirmEmailChange = async(req, res) => {
  const { token, id } = req.query;

  if (!token || !id) {
    throw ApiError.BadRequest('Invalid request parameters');
  }

  await userService.confirmEmailChange({
    token, id,
  });

  const user = await userService.getById(id);

  await sendAuthData(res, user);
};

const logout = async(req, res) => {
  if (req.isAuthenticated()) {
    req.logout((error) => {
      if (error) {
        throw error;
      }
    });
  } else {
    const { refreshToken } = req.cookies;
    const userData = jwtService.verifyRefresh(refreshToken);

    res.clearCookie('refreshToken');

    if (userData) {
      await tokenService.removeAll({ userId: userData.id });
    }

    delete req.session.userId;
  }

  res.sendStatus(204);
};

const addSocialAccount = async(req, res) => {
  const userId = req.session.userId || req.user.id;

  await accountService.add({
    userId,
    id: req.account.id,
    name: req.account.name,
    type: req.account.type,
  });

  res.redirect(`${process.env.CLIENT_HOST}/auth-callback`);
};

module.exports = {
  sendAuthData,
  register,
  activate,
  login,
  requestPasswordReset,
  confirmPasswordReset,
  resetPassword,
  confirmEmailChange,
  refresh,
  logout,
  addSocialAccount,
};
