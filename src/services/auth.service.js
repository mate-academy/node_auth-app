import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { ApiError } from '../exeptions/api.error.js';
import { RefreshToken } from '../models/refreshToken.js';
import { User } from '../models/user.js';
import {
  validateEmail,
  validateName,
  validatePassword,
} from '../validators/auth.validator.js';

import { emailService } from './email.service.js';
import { jwtService } from './jwt.service.js';
import { createRefreshToken } from './refreshToken.service.js';

const register = async ({ name, email, password }) => {
  const errors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.name || errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const emailExists = await User.findOne({ where: { email } });

  if (emailExists) {
    throw ApiError.badRequest('Email already exists');
  }

  const activationToken = uuidv4();

  const hashedPass = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hashedPass,
    activationToken,
  });

  await emailService.sendActivationEmail(email, activationToken);
};

const activate = async ({ activationToken }) => {
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (user.isActive) {
    throw ApiError.badRequest('User is already active');
  }

  user.isActive = true;
  user.activationToken = null;

  await user.save();
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  if (!user.password) {
    throw ApiError.badRequest('No such user');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  if (!user.isActive) {
    throw ApiError.badRequest('Activate your account');
  }

  const { accessToken, refreshToken } = await createTokens(user);

  return { user, refreshToken, accessToken };
};

const refresh = async ({ refreshToken }) => {
  if (!refreshToken) {
    throw ApiError.unauthorized();
  }

  const token = await RefreshToken.findOne({ where: { token: refreshToken } });

  if (!token) {
    throw ApiError.unauthorized();
  }

  const isExpired = Date.now() > token.expiresAt.getTime();

  if (isExpired) {
    await token.destroy();
    throw ApiError.unauthorized();
  }

  const user = await User.findOne({ where: { id: token.userId } });

  if (!user || !user.isActive) {
    throw ApiError.unauthorized();
  }

  const accessToken = jwtService.sign(user);

  return { user, accessToken };
};

const logout = async ({ refreshToken }) => {
  if (!refreshToken) {
    return;
  }

  await RefreshToken.destroy({
    where: { token: refreshToken },
  });
};

const completeLogin = async (user) => {
  const { accessToken, refreshToken } = await createTokens(user);

  return {
    user,
    accessToken,
    refreshToken,
  };
};

const createTokens = async (user) => {
  const accessToken = jwtService.sign(user);
  const refreshToken = await createRefreshToken(user.id);

  return { accessToken, refreshToken };
};

export const authService = {
  register,
  activate,
  login,
  refresh,
  logout,
  completeLogin,
};
