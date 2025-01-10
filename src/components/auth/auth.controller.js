'use strict';

const AuthService = require('../auth/services/auth.service');

async function register(req, res) {
  const { email, password } = req.body;

  const user = await AuthService.register(email, password);

  res.send(user);
}

async function activate(req, res) {
  const { activationToken } = req.body;

  const user = await AuthService.activate(activationToken);

  res.send(user);
}

async function logIn(req, res) {
  const { email, password } = req.body;

  const data = await AuthService.logIn(email, password);

  res.cookie('refreshToken', data.refreshToken);

  res.send({
    user: data.user,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });
}

async function refresh(req, res) {
  const { refreshToken } = req.body;

  const data = await AuthService.refresh(refreshToken);

  res.send({
    user: data.user,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });
}

async function logOut(req, res) {
  const { refreshToken } = req.body;

  await AuthService.logOut(refreshToken);

  res.sendStatus(204);
}

async function resetPassword(req, res) {
  const { email, password } = req.body;

  await AuthService.refreshPassword(email, password);

  res.status(201).send({ message: 'Password has been successfully changed' });
}

module.exports = {
  register,
  activate,
  logIn,
  refresh,
  logOut,
  resetPassword,
};
