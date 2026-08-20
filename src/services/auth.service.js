import * as mailService from './mail.service.js';
import * as tokenService from './token.service.js';
import * as userService from './user.service.js';
import { AppError } from '../core/AppError.js';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { TOKEN_TYPES } from '../constants/token.constant.js';

const register = async (name, email, password) => {
  if (await userService.getByEmail(email)) {
    throw new AppError('User with this email already exists', 409);
  }

  const activationToken = uuidv4();

  const user = await userService.createUser(name, email, password);

  await tokenService.saveToken(
    user.id,
    activationToken,
    TOKEN_TYPES.ACTIVATION,
    process.env.EXPIRES_IN_ACTIVATION_TOKEN,
  );

  await mailService.sendActivationLink(email, activationToken);
};

const login = async (email, password) => {
  const user = await userService.getByEmail(email);

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  if (!user.isActive) {
    throw new AppError('Please activate your email before logging in', 403);
  }

  const payload = { userId: user.id, email: user.email };

  const accessToken = await tokenService.generateAccessToken(payload);
  const refreshToken = await tokenService.generateAndSaveRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    user: user.toSafeObject(),
  };
};

const activate = async (activationToken) => {
  const token = await tokenService.findToken(
    activationToken,
    TOKEN_TYPES.ACTIVATION,
  );

  if (!token) {
    throw new AppError('Invalid activation token', 400);
  }

  const user = await userService.getById(token.userId);

  if (!user) {
    throw new AppError('Invalid activation token', 400);
  }

  await token.destroy();
  user.isActive = true;

  await user.save();

  return user.toSafeObject();
};

const forgotPassword = async (email) => {
  const user = await userService.getByEmail(email);

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const passwordResetToken = uuidv4();

  await tokenService.deleteTokenByUserId(user.id, TOKEN_TYPES.PASSWORD_RESET);

  await tokenService.saveToken(
    user.id,
    passwordResetToken,
    TOKEN_TYPES.PASSWORD_RESET,
    process.env.EXPIRES_IN_RESET_PASSWORD_TOKEN,
  );

  await mailService.sendResetPasswordLink(email, passwordResetToken);
};

const resetPassword = async (resetToken, newPassword) => {
  const token = await tokenService.findToken(
    resetToken,
    TOKEN_TYPES.PASSWORD_RESET,
  );

  if (!token) {
    throw new AppError('Invalid credentials', 401);
  }

  const user = await userService.getById(token.userId);

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  if (await user.comparePassword(newPassword)) {
    throw new AppError(
      'New password must be different from the old password',
      400,
    );
  }

  await tokenService.deleteTokenByUserId(user.id, TOKEN_TYPES.REFRESH);
  await token.destroy();

  user.password = newPassword;

  await user.save();
};

const refresh = async (token) => {
  let data = null;

  try {
    data = jwt.verify(token, process.env.REFRESH_TOKEN_SIGNATURE);
  } catch (error) {
    throw new AppError('Session is expired', 401);
  }

  const oldToken = await tokenService.findToken(token, TOKEN_TYPES.REFRESH);

  if (!oldToken) {
    throw new AppError('Session with provided token does not exist', 401);
  }

  await oldToken.destroy();

  const payload = { userId: data.userId, email: data.email };

  const accessToken = await tokenService.generateAccessToken(payload);
  const refreshToken = await tokenService.generateAndSaveRefreshToken(payload);

  return { user: payload, accessToken, refreshToken };
};

export { refresh, forgotPassword, resetPassword, register, login, activate };
