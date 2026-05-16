import type { RequestHandler } from 'express';
import { authService } from './auth.service.js';

type ActivateParams = {
  token: string;
};

type ResetPasswordParams = {
  token: string;
};

const register: RequestHandler = async (req, res) => {
  const user = await authService.register(req.body);

  res.status(201).json({ user });
};

const activate: RequestHandler<ActivateParams> = async (req, res) => {
  const { token } = req.params;

  const user = await authService.activate(token);

  res.json({
    user,
    message: 'Account activated successfully',
  });
};

const login: RequestHandler = async (req, res) => {
  const authData = await authService.login(req.body);

  res.json(authData);
};

const logout: RequestHandler = async (req, res) => {
  res.status(204).send();
};

const forgotPassword: RequestHandler = async (req, res) => {
  await authService.forgotPassword(req.body);

  res.json({
    message: 'If an account exists, a password reset link has been sent',
  });
};

const resetPassword: RequestHandler<ResetPasswordParams> = async (req, res) => {
  const { token } = req.params;

  await authService.resetPassword(token, req.body);

  res.json({
    message: 'Password has been reset successfully',
  });
};

export const authController = {
  register,
  activate,
  login,
  logout,
  forgotPassword,
  resetPassword,
};
