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

  if (!user) {
    return res.status(400).send({ message: 'Invalid activation token' });
  }

  res.redirect('/profile');
}

async function logIn(req, res) {
  const { email, password } = req.body;

  const data = await AuthService.logIn(email, password);

  if (!data.user.isActive) {
    return res
      .status(403)
      .send({ message: 'Please activate your email to log in' });
  }

  res.cookie('refreshToken', data.refreshToken);

  res.redirect('/profile');
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
  const { email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).send({ message: 'Passwords do not match' });
  }

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
