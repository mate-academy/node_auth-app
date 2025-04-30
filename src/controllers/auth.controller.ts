import { RequestHandler, Response } from 'express';

import { userService } from '../services/user.service.js';
import { authService } from '../services/auth.service.js';

import { userRepository } from '../entity/user.repository.js';
import { tokenRepository } from '../entity/token.repository.js';

import { jwt } from '../utils/jwt.js';
import { NormalizedUser } from '../types/NormalizedUser.js';
import { TokenType } from '@prisma/client';
import { tokenService } from '../services/token.service.js';

const register: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  const name = (req.body.name || '').trim();

  await authService.register(name, email, password);

  res.json({ message: 'OK' });
};

const activate: RequestHandler = async (req, res) => {
  const { token } = req.params;
  const normalizedUser = await authService.activate(token);

  await sendAuthentication(res, normalizedUser);
};

const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  const normalizedUser = await authService.login(email, password);

  await sendAuthentication(res, normalizedUser);
};

const refresh: RequestHandler = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || '';
  const normalizedUser = await authService.refresh(refreshToken);

  await sendAuthentication(res, normalizedUser);
};

const logout: RequestHandler = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || '';

  await authService.logout(refreshToken);

  res.clearCookie('refreshToken');
  res.sendStatus(204);
};

const requestPasswordReset: RequestHandler = async (req, res) => {
  const { email } = req.body;

  await authService.requestPasswordReset(email);

  res.json({ message: 'OK' });
};

const resetPassword: RequestHandler = async (req, res) => {
  const { token } = req.params;
  const { newPassword, passwordConfirmation } = req.body;

  const normalizedUser = await authService.resetPassword(
    token,
    newPassword,
    passwordConfirmation,
  );

  await sendAuthentication(res, normalizedUser);
};

const requestEmailChange: RequestHandler = async (req, res) => {
  const user = req.user!;
  const { password, newEmail } = req.body;

  await authService.requestEmailChange(user, password, newEmail);

  res.json({ message: 'OK' });
};

const changeEmail: RequestHandler = async (req, res) => {
  const { token } = req.params;
  const normalizedUser = await authService.changeEmail(token);

  await sendAuthentication(res, normalizedUser);
};

async function sendAuthentication(
  res: Response,
  normalizedUser: NormalizedUser,
) {
  const { accessToken, refreshToken } =
    await tokenService.createAuthTokens(normalizedUser);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.json({
    message: 'OK',

    accessToken,
    user: normalizedUser,
  });
}

export const authController = {
  register,
  activate,
  login,
  logout,
  refresh,

  resetPassword,
  requestPasswordReset,

  changeEmail,
  requestEmailChange,
};
