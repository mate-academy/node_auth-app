'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');

const { users } = require('../models/user.model');
const {
  sendActivationEmail,
  sendResetPasswordEmail,
  sendEmailChangedNotification,
} = require('../services/email.service');

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const isPasswordValid = (password) => PASSWORD_PATTERN.test(password);

const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send('Missing fields');
  }

  if (!isPasswordValid(password)) {
    return res.status(400).send('Password does not meet requirements');
  }

  const hash = await bcrypt.hash(password, 10);

  const activationToken = uuid();

  const user = {
    id: uuid(),
    name,
    email,
    password: hash,
    isActive: false,
    activationToken,
  };

  users.push(user);

  await sendActivationEmail(email, activationToken);

  res
    .status(201)
    .send(
      'Registration successful. Please check your email ' +
        'for the activation link.',
    );
};

const activate = (req, res) => {
  const { token } = req.params;

  const user = users.find((u) => u.activationToken === token);

  if (!user) {
    return res.status(404).send('Invalid token');
  }

  user.isActive = true;
  delete user.activationToken;

  res.redirect('/profile');
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(401).send('Invalid credentials');
  }

  if (!user.isActive) {
    return res.status(403).send('Activate email first');
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(401).send('Invalid credentials');
  }

  const token = jwt.sign({ id: user.id }, 'secret', {
    expiresIn: '1d',
  });

  res.set('Authorization', `Bearer ${token}`);
  res.redirect('/profile');
};

const profile = (req, res) => {
  const user = users.find((u) => u.id === req.user.id);

  if (!user) {
    return res.status(404).send('User not found');
  }

  res.send(user);
};

const logout = (req, res) => {
  res.redirect('/login');
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send('Missing fields');
  }

  const user = users.find((u) => u.email === email);

  if (user) {
    const resetToken = uuid();

    user.resetToken = resetToken;

    await sendResetPasswordEmail(email, resetToken);
  }

  res.send({
    message: 'If the email exists, a password reset link has been sent.',
    page: 'emailSent',
  });
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    return res.status(400).send('Missing fields');
  }

  if (password !== confirmPassword) {
    return res.status(400).send('Passwords do not match');
  }

  const user = users.find((u) => u.resetToken === token);

  if (!user) {
    return res.status(404).send('User not found');
  }

  user.password = await bcrypt.hash(password, 10);
  delete user.resetToken;

  res.send({ message: 'Password updated', page: 'resetSuccess' });
};

const updateProfileName = (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).send('Missing fields');
  }

  const user = users.find((u) => u.id === req.user.id);

  if (!user) {
    return res.status(404).send('User not found');
  }

  user.name = name;

  res.send(user);
};

const updateProfilePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!oldPassword || !newPassword || !confirmPassword) {
    return res.status(400).send('Missing fields');
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).send('Passwords do not match');
  }

  const user = users.find((u) => u.id === req.user.id);

  if (!user) {
    return res.status(404).send('User not found');
  }

  const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isOldPasswordValid) {
    return res.status(401).send('Invalid credentials');
  }

  user.password = await bcrypt.hash(newPassword, 10);

  res.send('Password updated');
};

const updateProfileEmail = async (req, res) => {
  const { password, newEmail } = req.body;

  if (!password || !newEmail) {
    return res.status(400).send('Missing fields');
  }

  const user = users.find((u) => u.id === req.user.id);

  if (!user) {
    return res.status(404).send('User not found');
  }

  const isPasswordValidForEmailUpdate = await bcrypt.compare(
    password,
    user.password,
  );

  if (!isPasswordValidForEmailUpdate) {
    return res.status(401).send('Invalid credentials');
  }

  const oldEmail = user.email;

  user.email = newEmail;

  await sendEmailChangedNotification(oldEmail, newEmail);

  res.send(user);
};

module.exports = {
  register,
  activate,
  login,
  profile,
  logout,
  requestPasswordReset,
  resetPassword,
  updateProfileName,
  updateProfilePassword,
  updateProfileEmail,
};
