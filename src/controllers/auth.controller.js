'use strict';

const { authService } = require('../services/auth.service');

const {
  setRefreshCookie,
  clearRefreshCookie,
  getRefreshToken,
} = require('../utils/refreshCookie');

function sendSession(res, session, status = 200) {
  setRefreshCookie(res, session.refreshToken);

  res.status(status).json({
    user: session.user,
    accessToken: session.accessToken,
  });
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

  sendSession(res, session);
}

async function login(req, res) {
  const session = await authService.login(req.body);

  sendSession(res, session);
}

async function refresh(req, res) {
  const session = await authService.refresh(getRefreshToken(req));

  sendSession(res, session);
}

async function logout(req, res) {
  await authService.logout(getRefreshToken(req));

  clearRefreshCookie(res);

  res.status(204).send();
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
