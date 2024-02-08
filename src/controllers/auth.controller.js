'use strict';

const bcrypt = require('bcrypt');

const { ApiError } = require('../exceptions/api.error');
const { userService } = require('../services/user.service');
const { jwtService } = require('../services/jwt.service');
const { tokenService } = require('../services/token.service');
const {
  validateUsername,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} = require('../utils/validation');

const register = async(req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    throw ApiError.BadRequest('Not enough or wrong data');
  }

  const errors = {
    username: validateUsername(username || ''),
    email: validateEmail(email || ''),
    password: validatePassword(password || ''),
  };

  if (errors.email || errors.password || errors.username) {
    throw ApiError.BadRequest('Bad request', errors);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userService.register(email, hashedPassword, username);

  res.sendStatus(204);
};

const activate = async(req, res) => {
  const { activationToken } = req.params;

  if (!activationToken) {
    throw ApiError.BadRequest('Not enough or wrong data');
  }

  const user = await userService.activateNewUser(activationToken);

  await generateTokens(res, user);
};

const refresh = async(req, res) => {
  const { refreshToken } = req.cookies;

  const user = jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!user || !token) {
    throw ApiError.Unauthorized();
  }

  await generateTokens(res, user);
};

const login = async(req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw ApiError.BadRequest('Not enough or wrong data');
  }

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.NotFound('No such user');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Wrong password');
  }

  if (user.activationToken) {
    const errors = {
      email: 'User still doesn\'t confirmed',
    };

    throw ApiError.Unauthorized(errors);
  }

  await generateTokens(res, user);
};

const generateTokens = async(res, user) => {
  const normalizedUser = userService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

const logout = async(req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw ApiError.BadRequest('Not enough or wrong data');
  }

  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData) {
    throw ApiError.Unauthorized();
  }

  await tokenService.remove(userData.id);

  res.sendStatus(204);
};

const confirmNewEmail = async(req, res) => {
  const { confirmationToken } = req.params;

  if (!confirmationToken) {
    throw ApiError.BadRequest('Not enough or wrong data');
  }

  const user = await userService
    .updateEmailByConfirmationToken(confirmationToken);

  await generateTokens(res, user);
};

const resetPassword = async(req, res) => {
  const { email } = req.body;

  if (!email) {
    throw ApiError.BadRequest('Not enough or wrong data');
  }

  const errors = {
    email: validateEmail(email || ''),
  };

  if (errors.email) {
    throw ApiError.BadRequest('Bad request', errors);
  }

  await userService.resetPasswordByEmail(email);

  res.sendStatus(204);
};

const confirmationResetPassword = async(req, res) => {
  const { confirmationResetToken } = req.params;
  const { resetPasswordData } = req.body;
  const { newPassword, confirmationPassword } = resetPasswordData;

  if (!confirmationResetToken
    || !newPassword
    || !confirmationPassword) {
    throw ApiError.BadRequest('Not enough or wrong data');
  }

  const errors = {
    password: validatePassword(resetPasswordData.newPassword || ''),
    confirmPassword: validateConfirmPassword(newPassword, confirmationPassword),
  };

  if (errors.password || errors.confirmPassword) {
    throw ApiError.BadRequest('Bad request', errors);
  }

  await userService
    .confirmResetPasswordByToken(confirmationResetToken, newPassword);

  res.sendStatus(204);
};

const authController = {
  register,
  activate,
  refresh,
  login,
  logout,
  confirmNewEmail,
  resetPassword,
  confirmationResetPassword,
};

module.exports = { authController };
