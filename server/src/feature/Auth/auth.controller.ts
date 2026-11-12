import type { RequestHandler } from 'express';
import { authService } from './auth.service.js';
import { sendAuthentication } from '../../utils/sendAuthentication.js';

const register: RequestHandler = async (req, res) => {
  const { name, email, password } = req.body;
  const newUser = await authService.register(name, email, password);

  res.json({
    user: newUser,
  });
};

const activate: RequestHandler = async (req, res) => {
  const { email, token } = req.params;
  const data = await authService.activate(email, token);

  return sendAuthentication(res, data);
};

const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  const data = await authService.login(email, password);

  return sendAuthentication(res, data);
};

const logout: RequestHandler = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || '';

  await authService.logout(refreshToken);

  res.clearCookie('refreshToken');
  res.sendStatus(204);
};

const refresh: RequestHandler = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || '';
  const data = await authService.refresh(refreshToken);

  return sendAuthentication(res, data);
};

const forgotPassword: RequestHandler = async (req, res) => {
  const { email } = req.body;
  const result = await authService.forgotPassword(email);

  return res.status(201).json(result);
};

const resetPassword: RequestHandler = async (req, res) => {
  const { token } = req.params;
  const { password, confirmation } = req.body;
  const result = await authService.resetPassword(token, password, confirmation);

  return res.status(201).json(result);
};

export const authController = {
  register,
  activate,
  login,
  logout,
  refresh,
  forgotPassword,
  resetPassword,
};
