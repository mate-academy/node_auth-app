import 'dotenv/config';
import nodeCrypto from 'crypto';
import bcrypt from 'bcrypt';
import dayjs from 'dayjs';
import { RequestHandler, Response as ExpressResponse } from 'express';

import { User } from '@prisma/client';
import { usersRepository } from '../entity/users.repository.js';
import { NormalizedUser, userService } from '../services/user.service.js';
import { ApiError } from '../exeptions/api.error.js';
import { mailer } from '../utils/mailer.js';
import { jwt } from '../utils/jwt.js';
import { tokensRepository } from '../entity/tokens.repository.js';
import { usersController } from './users.controller.js';
import {
  validateEmail,
  validateName,
  validatePassword,
} from '../../utils/validators.js';

async function sendAuthentication(res: ExpressResponse, user: User) {
  const userData = userService.normalize(user);
  const accessToken = jwt.generateAccessToken(userData);
  const refreshToken = jwt.generateRefreshToken(userData);

  await tokensRepository.deleteByUserId(user.id);
  await tokensRepository.create(user.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.send({
    user: userData,
    accessToken,
  });
}

const register: RequestHandler = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    nameError: validateName(name),
    emailError: validateEmail(email),
    passwordError: validatePassword(password),
  };

  if (Object.values(errors).some((error) => error)) {
    throw ApiError.badRequest('Params are invalid', errors);
  }

  const userWithEmail = await usersRepository.getByEmail(email);

  if (userWithEmail) {
    throw ApiError.badRequest('Email is already taken');
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const activationToken = nodeCrypto.randomBytes(32).toString('hex');

  const user = await usersRepository.create(
    name,
    email,
    hashedPassword,
    activationToken,
  );

  await mailer.sendActivationLink(email, activationToken);

  res.json(userService.normalize(user));
};

const activate: RequestHandler = async (req, res) => {
  const { token, email } = req.params;
  const tokenString = Array.isArray(token) ? token[0] : token;

  const user = await usersRepository.getByActivationToken(tokenString);

  if (!user || (user.email !== email && user.pendingEmail !== email)) {
    throw ApiError.notFound();
  }

  const updatedUser = await usersRepository.update(user.id, {
    email: user.pendingEmail ?? user.email,
    pendingEmail: null,
    activationToken: null,
  });

  await sendAuthentication(res, updatedUser);

  if (user.pendingEmail) {
    await mailer.sendEmailChangeNotification(user.email, user.pendingEmail);
  }
};

const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  const user = await usersRepository.getByEmail(email);
  const isPasswordValid = await bcrypt.compare(password, user?.password || '');

  if (!user || !isPasswordValid) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  if (user.activationToken) {
    throw ApiError.forbidden('Please activate your account');
  }

  await sendAuthentication(res, user);
};

const refresh: RequestHandler = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || '';
  const userData = jwt.validateRefreshToken(refreshToken) as NormalizedUser;
  const user = await usersRepository.getByEmail(userData?.email || '');
  const token = await tokensRepository.getByToken(refreshToken);

  if (!user || !userData || !token || token.userId !== user.id) {
    res.clearCookie('refreshToken');
    throw ApiError.unauthorized('Invalid token');
  }

  await sendAuthentication(res, user);
};

const logout: RequestHandler = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || '';
  const userData = jwt.validateRefreshToken(refreshToken) as NormalizedUser;

  if (userData) {
    await tokensRepository.deleteByUserId(userData.id);
  }

  res.clearCookie('refreshToken');
  res.sendStatus(204);
};

const requestPasswordReset: RequestHandler = async (req, res) => {
  const { email } = req.body;

  const user = await usersRepository.getByEmail(email);

  if (user) {
    if (
      user.resetTokenExpires &&
      Date.now() < user.resetTokenExpires.getTime() - 55 * 60 * 1000
    ) {
      return res.sendStatus(204);
    }

    const resetToken = nodeCrypto.randomBytes(32).toString('hex');

    await usersRepository.update(user.id, {
      resetToken,
      resetTokenExpires: dayjs().add(1, 'hour').toDate(),
    });

    await mailer.sendResetPasswordLink(email, resetToken);
  }

  res.sendStatus(204);
};

const validateResetToken: RequestHandler = async (req, res) => {
  const { token } = req.params;
  const tokenString = Array.isArray(token) ? token[0] : token;

  const user = await usersRepository.getByResetToken(tokenString);

  if (
    !user ||
    user.resetTokenExpires === null ||
    user.resetTokenExpires < new Date()
  ) {
    throw ApiError.badRequest('This reset link is invalid or expired');
  }

  res.sendStatus(204);
};

const resetPassword: RequestHandler = async (req, res) => {
  const { token } = req.body;
  const tokenString = Array.isArray(token) ? token[0] : token;

  const user = await usersRepository.getByResetToken(tokenString);

  if (
    !user ||
    user.resetTokenExpires === null ||
    user.resetTokenExpires < new Date()
  ) {
    throw ApiError.badRequest('Token expired');
  }

  const { password } = await usersController.checkNewPassword(req);

  await usersRepository.update(user.id, {
    password,
    resetToken: null,
    resetTokenExpires: null,
  });

  res.sendStatus(204);
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  validateResetToken,
  requestPasswordReset,
  resetPassword,
};
