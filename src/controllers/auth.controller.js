'use strict';

const { authService } = require('../services/auth.service');

const {
  setRefreshCookie,
  clearRefreshCookie,
  getRefreshToken,
} = require('../utils/refreshCookie');

function clientUrl(path) {
  return (process.env.CLIENT_URL || '/app') + path;
}

async function register(req, res) {
  const user = await authService.register(req.body);

  res.status(201).json({
    user,
    message: 'Activation email has been sent',
  });
}

async function activate(req, res) {
  const session = await authService.activate(req.params.token);

  setRefreshCookie(res, session.refreshToken);

  res.redirect(302, clientUrl('/profile'));
}

async function login(req, res) {
  const session = await authService.login(req.body);

  setRefreshCookie(res, session.refreshToken);

  res.redirect(303, clientUrl('/profile'));
}

async function refresh(req, res) {
  const session = await authService.refresh(getRefreshToken(req));

  setRefreshCookie(res, session.refreshToken);

  res.status(200).json({
    user: session.user,
    accessToken: session.accessToken,
  });
}

async function logout(req, res) {
  await authService.logout(getRefreshToken(req));

  clearRefreshCookie(res);

  res.redirect(303, clientUrl('/login'));
}

async function requestPasswordReset(req, res) {
  await authService.requestPasswordReset(req.body.email);

  res.status(200).json({
    message: 'If the email exists, the reset link has been sent',
  });
}

async function resetPassword(req, res) {
  const { password, confirmation } = req.body;

  await authService.resetPassword(req.params.token, password, confirmation);

  res.status(200).json({
    message: 'Password has been changed successfully',
  });
}

module.exports = {
  register,
  activate,
  login,
  refresh,
  logout,
  requestPasswordReset,
  resetPassword,
};
