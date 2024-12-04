import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import * as userService from '../services/user.service.js';
import * as jwtService from '../services/jwt.service.js';
import * as tokenService from '../services/token.service.js';
import * as emailService from '../services/email.service.js';

import ApiError from '../exeptions/api.error.js';
import { hashPassword } from '../utils/helpers.js';

const sendAuthentification = async (user, oldRefreshToken) => {
  const secureUser = userService.secureUser(user);

  const accessToken = jwtService.createToken(secureUser);
  const refreshToken = jwtService.createRefreshToken(secureUser);

  await tokenService.createToken(user.id, refreshToken);

  if (oldRefreshToken) {
    await tokenService.deleteTokenByToken(oldRefreshToken);
  }

  return {
    secureUser,
    refreshToken,
    accessToken,
  };
};

export const login = async ({ email, password }) => {
  const user = await userService.findUser(email);

  if (!user || user.activationToken) {
    throw ApiError.notFound('User not found');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Invalid password');
  }

  return sendAuthentification(user);
};

export const register = async ({ email, password, name }) => {
  const user = await userService.findUser(email);

  if (user) {
    throw ApiError.badRequest('User already exists');
  }

  const hashedPassword = await hashPassword(password);

  const activationToken = uuidv4();

  await userService.createUser({
    email,
    password: hashedPassword,
    name,
    activationToken,
  });

  emailService.sendActivationEmail(email, activationToken);
};

export const activate = async ({ activationToken }) => {
  const user = await userService.findUserByActivationToken(activationToken);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  await userService.setActivationToken(activationToken);
};

export const resetPassword = async ({ email }) => {
  const user = await userService.findUser(email);

  if (!user || user.activationToken) {
    throw ApiError.notFound('User not found');
  }

  const token = uuidv4();

  await userService.setResetPasswordToken(user, token);

  emailService.sendResetPasswordEmail(email, token);
};

export const setPassword = async ({ password, resetPasswordToken }) => {
  const user =
    await userService.findUserByResetPasswordToken(resetPasswordToken);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const hashedPassword = await hashPassword(password);

  await userService.setPassword(user, hashedPassword);
  await userService.setResetPasswordToken(user, null);

  await tokenService.deleteAllTokenByUserId(user.id);
};

export const logout = async ({ refreshToken }) => {
  const userData = jwtService.verifyRefreshToken(refreshToken);

  if (userData) {
    await tokenService.deleteTokenByToken(refreshToken);
  }
};

export const refresh = async ({ refreshToken }) => {
  const findedRefreshToken = await tokenService.findTokenByToken(refreshToken);

  if (!findedRefreshToken) {
    throw ApiError.unauthorized();
  }

  try {
    const userData = jwtService.verifyRefreshToken(refreshToken);

    if (!userData) {
      throw ApiError.unauthorized();
    }

    const user = await userService.findUser(userData.email);

    if (!user) {
      throw ApiError.notFound();
    }

    return sendAuthentification(user, refreshToken);
  } catch (error) {
    throw ApiError.unauthorized(error);
  }
};
