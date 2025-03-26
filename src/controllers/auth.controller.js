'use strict';

import tokenRepository from '../entity/token.repository.js';
import usersRepository from '../entity/users.repository.js';
import { ApiError } from '../exceptions/api.error.js';
import jwtService from '../services/jwt.service.js';
import userService from '../services/user.service.js';
import mailer from '../utils/mailer.js';

const register = async (req, res) => {
  const { email, password, name } = req.body;

  const newUser = await userService.register({ email, password, name });

  res.json({
    newUser: userService.normalize(newUser),
    message: 'Check your email for activation link',
  });
};

const activate = async (req, res) => {
  const { email, activationToken } = req.params;

  const activatedUser = await userService.activate({ email, activationToken });

  await sendAuthentication(res, activatedUser);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.login({ email, password });

  await sendAuthentication(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefreshToken(refreshToken);
  const token = await tokenRepository.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized({ message: 'Invalid token' });
  }

  const user = await usersRepository.findByEmail(userData.email);

  if (!user) {
    throw ApiError.unauthorized({ message: 'No such user' });
  }

  await sendAuthentication(res, userData);
};

const sendAuthentication = async (res, user) => {
  const userData = userService.normalize(user);

  const accessToken = jwtService.generateAccessToken(userData);
  const refreshToken = jwtService.generateRefreshToken(userData);
  const expiresAt = jwtService.getExpiresAt(refreshToken);
  const maxAge = expiresAt - Date.now();

  await tokenRepository.updateOrCreate({
    userId: userData.id,
    newToken: refreshToken,
    type: 'refresh',
    expiresAt,
  });

  res.cookie('refreshToken', refreshToken, {
    maxAge,
    HttpOnly: true,
  });

  res.json({
    user: userData,
    accessToken,
  });
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = await jwtService.verifyRefreshToken(refreshToken);

  if (userData) {
    await tokenRepository.deleteByUserId(userData.id);
  }

  res.clearCookie('refreshToken');
  res.sendStatus(204);
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const errors = {
    email: userService.validateEmail(email),
  };

  if (Object.values(errors).some((error) => error)) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const user = await usersRepository.findByEmail(email);

  if (!user) {
    throw ApiError.notFound({ email: 'No such user with this email' });
  }

  if (user.activationToken) {
    throw ApiError.unauthorized({
      message: 'Account is not activated. Please check your email to activate',
    });
  }

  await tokenRepository.deleteByUserId(user.id);

  const normalizedUser = userService.normalize(user);

  const resetToken = await jwtService.generateResetToken(normalizedUser);
  const expiresAt = jwtService.getExpiresAt(resetToken);

  await tokenRepository.updateOrCreate({
    userId: user.id,
    newToken: resetToken,
    type: 'reset',
    expiresAt,
  });

  await mailer.sendResetPasswordLink(email, resetToken);

  res.json({
    message: 'Check your email for reset password link',
  });
};

const resetPassword = async (req, res) => {
  const { resetToken, newPassword, confirmPassword } = req.body;

  const errors = {
    newPassword: userService.validatePassword(newPassword),
    confirmPassword: userService.validatePassword(confirmPassword),
  };

  if (Object.values(errors).some((error) => error)) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const token = await tokenRepository.getByToken(resetToken);
  const userData = jwtService.verifyResetToken(resetToken);

  if (!token || !userData) {
    throw ApiError.unauthorized({ message: 'Invalid token' });
  }

  await userService.resetPassword(userData.email, {
    newPassword,
    confirmPassword,
  });

  await tokenRepository.deleteByUserId(token.userId, 'reset');

  res.json({
    message: 'Password changed successfully',
  });
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
};
