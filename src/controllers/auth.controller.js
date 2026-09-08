import { normalizeUser } from '../utils/normalizeUser.js';
import { authService } from '../services/auth.service.js';

const register = async (req, res) => {
  const { name, email, password } = req.body;

  await authService.register({ name, email, password });

  res.status(201).send({
    message: 'Registration successful. Please check your email.',
  });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  await authService.activate({ activationToken });

  res.status(200).send({
    message: 'Activation successful.',
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const { user, refreshToken, accessToken } = await authService.login({
    email,
    password,
  });

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  res.send({
    user: normalizeUser(user),
    accessToken,
  });
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const { user, accessToken } = await authService.refresh({ refreshToken });

  res.send({
    user: normalizeUser(user),
    accessToken,
  });
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  await authService.logout({ refreshToken });

  res.clearCookie('refreshToken');

  res.send({
    message: 'Logout successful',
  });
};

const loginGoogle = async (req, res) => {
  const user = req.user;

  const result = await authService.completeLogin(user);

  res.cookie('refreshToken', result.refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  res.send({
    user: normalizeUser(user),
    accessToken: result.accessToken,
  });
};

const loginGithub = async (req, res) => {
  const user = req.user;

  const result = await authService.completeLogin(user);

  res.cookie('refreshToken', result.refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  res.send({
    user: normalizeUser(user),
    accessToken: result.accessToken,
  });
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  loginGoogle,
  loginGithub,
};
