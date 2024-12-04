import { validationResult } from 'express-validator';

import * as authService from '../services/auth.service.js';

import ApiError from '../exeptions/api.error.js';

export const login = async (req, res) => {
  const validationResults = validationResult(req);

  if (!validationResults.isEmpty()) {
    throw ApiError.badRequest(validationResults.array());
  }

  const { email, password } = req.body;

  const { secureUser, refreshToken, accessToken } = await authService.login({
    email,
    password,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  return res.status(200).json({ user: secureUser, accessToken });
};

export const register = async (req, res) => {
  const validationResults = validationResult(req);

  if (!validationResults.isEmpty()) {
    throw ApiError.badRequest(validationResults.array());
  }

  const { email, password, name } = req.body;

  await authService.register({ email, password, name });

  return res.status(201).json({ message: 'User created' });
};

export const activate = async (req, res) => {
  const validationResults = validationResult(req);

  if (!validationResults.isEmpty()) {
    throw ApiError.badRequest(validationResults.array());
  }

  const { activationToken } = req.params;

  await authService.activate({ activationToken });

  res.sendStatus(204);
};

export const resetPassword = async (req, res) => {
  const validationResults = validationResult(req);

  if (!validationResults.isEmpty()) {
    throw ApiError.badRequest(validationResults.array());
  }

  const { email } = req.body;

  await authService.resetPassword({ email });

  res.sendStatus(204);
};

export const setPassword = async (req, res) => {
  const validationResults = validationResult(req);

  if (!validationResults.isEmpty()) {
    throw ApiError.badRequest(validationResults.array());
  }

  const { resetPasswordToken } = req.params;
  const { password } = req.body;

  await authService.setPassword({ password, resetPasswordToken });

  res.sendStatus(204);
};

export const logout = async (req, res) => {
  res.clearCookie('refreshToken');

  const refreshToken = req.cookies.refreshToken || '';

  await authService.logout({ refreshToken });

  res.sendStatus(204);
};

export const refresh = async (req, res) => {
  const oldRefreshToken = req.cookies.refreshToken || '';

  const { secureUser, refreshToken, accessToken } = await authService.refresh({
    refreshToken: oldRefreshToken,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  return res.status(200).json({ user: secureUser, accessToken });
};
