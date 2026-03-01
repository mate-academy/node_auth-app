/* eslint-disable max-len */

import bcrypt from 'bcrypt';
import { userService } from '../services/user.service.js';
import { emailService } from '../services/email.service.js';
import { jwtService } from '../services/jwt.service.js';
import { tokenService } from '../services/token.service.js';
import { ApiError } from '../exceptions/api.error.js';

async function register(req, res) {
  const { name, email, password } = req.body;

  const validationErrors = {
    name: userService.validateName(name),
    email: userService.validateEmail(email),
    password: userService.validatePassword(password),
  };

  if (
    validationErrors.name ||
    validationErrors.email ||
    validationErrors.password
  ) {
    throw ApiError.BadRequest('Validation error', validationErrors);
  }

  const existingUser = await userService.getByEmail(email);

  if (existingUser) {
    throw ApiError.BadRequest('User already exists');
  }

  const user = await userService.create(name, email, password);

  await emailService.sendActivationLink(user.email, user.activationToken);

  res.status(201).json({
    message:
      'User registered successfully. Please check your email to activate your account.',
    user: {
      id: user.id,
      email: user.email,
    },
  });
}

async function activate(req, res) {
  const { activationToken } = req.params;
  const user = await userService.getByActivationToken(activationToken);

  if (!user) {
    throw ApiError.BadRequest('Invalid or expired activation link');
  }

  await userService.activate(user.id);

  res.status(200).json({ message: 'Account successfully activated' });
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('User with this email does not exist');
  }

  if (user.activationToken) {
    throw ApiError.BadRequest(
      'Account is not activated. Please check your email.',
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Password is wrong');
  }

  const userData = userService.normalize(user);
  const accessToken = jwtService.generateAccessToken(userData);
  const refreshToken = jwtService.generateRefreshToken(userData);

  await tokenService.save(user.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 3600 * 1000,
    httpOnly: true,
  });

  res.send({
    user: userData,
    accessToken,
  });
}

async function refresh(req, res) {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw ApiError.Unauthorized();
  }

  const userData = jwtService.validateRefreshToken(refreshToken);

  if (!userData) {
    throw ApiError.Unauthorized();
  }

  const tokenFromDb = await tokenService.getByToken(refreshToken);

  if (!tokenFromDb) {
    throw ApiError.Unauthorized();
  }

  const user = await userService.getByEmail(userData.email);

  if (!user) {
    throw ApiError.Unauthorized();
  }

  const normalizedUser = userService.normalize(user);
  const newAccessToken = jwtService.generateAccessToken(normalizedUser);
  const newRefreshToken = jwtService.generateRefreshToken(normalizedUser);

  await tokenService.save(user.id, newRefreshToken);

  res.cookie('refreshToken', newRefreshToken, {
    maxAge: 30 * 24 * 3600 * 1000,
    httpOnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToken: newAccessToken,
  });
}

async function logout(req, res) {
  const { refreshToken } = req.cookies;

  if (refreshToken) {
    await tokenService.removeByToken(refreshToken);
    res.clearCookie('refreshToken');
  }

  return res.status(204).send();
}

async function forgotPassword(req, res) {
  const { email } = req.body;

  if (!email) {
    throw ApiError.BadRequest('Email is required');
  }

  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('User with this email does not exist');
  }

  const normalizedUser = userService.normalize(user);
  const resetToken = jwtService.generateResetToken(normalizedUser);

  await emailService.sendResetPasswordLink(user.email, resetToken);

  res.status(200).json({ message: 'Password reset link sent to your email' });
}

async function resetPassword(req, res) {
  const { resetToken, newPassword, confirmation } = req.body;

  if (!newPassword || !confirmation) {
    throw ApiError.BadRequest('New password and confirmation are required');
  }

  if (newPassword !== confirmation) {
    throw ApiError.BadRequest('New password and confirmation do not match');
  }

  const passwordError = userService.validatePassword(newPassword);

  if (passwordError) {
    throw ApiError.BadRequest(passwordError);
  }

  const userData = jwtService.validateResetToken(resetToken);

  if (!userData) {
    throw ApiError.BadRequest('Invalid or expired reset token');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await userService.updatePassword(userData.id, hashedPassword);

  res.status(200).json({ message: 'Password successfully reset' });
}

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
};
