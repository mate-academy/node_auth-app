import ms from 'ms';
import * as authService from '../services/auth.service.js';
import * as tokenService from '../services/token.service.js';
import { TOKEN_TYPES } from '../constants/token.constant.js';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: ms(process.env.EXPIRES_IN_REFRESH_TOKEN),
  sameSite: 'strict',
};

const clearCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

const register = async (req, res) => {
  const { name, email, password } = req.body;

  await authService.register(name, email, password);

  res.sendStatus(204);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await authService.login(
    email,
    password,
  );

  res.cookie('RefreshToken', refreshToken, cookieOptions);

  res.status(200).json({
    status: 'success',
    accessToken,
    user,
  });
};

const activate = async (req, res) => {
  const { token } = req.params;

  await authService.activate(token);

  res.sendStatus(204);
};

const logout = async (req, res) => {
  const { RefreshToken } = req.cookies;

  await tokenService.deleteToken(RefreshToken, TOKEN_TYPES.REFRESH);

  res.clearCookie('RefreshToken', clearCookieOptions);

  res.sendStatus(204);
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  await authService.forgotPassword(email);

  res.sendStatus(204);
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  await authService.resetPassword(token, password);

  res.clearCookie('RefreshToken', clearCookieOptions);

  res.sendStatus(204);
};

const refresh = async (req, res) => {
  const { RefreshToken } = req.cookies;

  const {
    user,
    accessToken,
    refreshToken: newRefreshToken,
  } = await authService.refresh(RefreshToken);

  res.cookie('RefreshToken', newRefreshToken, cookieOptions);

  res.status(200).json({
    status: 'success',
    accessToken,
    user,
  });
};

export {
  forgotPassword,
  resetPassword,
  refresh,
  register,
  login,
  activate,
  logout,
};
