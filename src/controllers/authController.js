'use strict';

const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const User = require('../models/User');
const Token = require('../models/Token');
const emailService = require('../services/email');
const { validatePassword } = require('../utils/validation');

function tokenExpiresAt(hours = 24) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

// GET /api/auth/me
async function me(req, res) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const user = await User.findByPk(req.session.userId, {
    attributes: ['id', 'name', 'email'],
  });

  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  res.json({ user });
}

// POST /api/auth/register
async function register(req, res) {
  const { name, email, password, confirmation } = req.body;

  if (!name || !email || !password || !confirmation) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (password !== confirmation) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  const passwordError = validatePassword(password);

  if (passwordError) {
    return res.status(400).json({ error: passwordError });
  }

  const existing = await User.findOne({ where: { email } });

  if (existing) {
    return res.status(400).json({ error: 'This email is already registered.' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });

  const token = await Token.create({
    type: 'activation',
    userId: user.id,
    expiresAt: tokenExpiresAt(24),
  });

  await emailService.sendActivationEmail(email, token.id);

  res.json({
    message:
      'Registration successful! Check your email to activate your account.',
  });
}

// POST /api/auth/activate/:token
async function activate(req, res) {
  const token = await Token.findOne({
    where: {
      id: req.params.token,
      type: 'activation',
      expiresAt: { [Op.gt]: new Date() },
    },
  });

  if (!token) {
    return res
      .status(400)
      .json({ error: 'This activation link is invalid or has expired.' });
  }

  await User.update({ isActive: true }, { where: { id: token.userId } });

  const user = await User.findByPk(token.userId, {
    attributes: ['id', 'name', 'email'],
  });

  await token.destroy();

  req.session.userId = user.id;
  req.session.userName = user.name;

  res.json({ user });
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (!user.isActive) {
    return res
      .status(403)
      .json({ error: 'Please activate your account first. Check your email.' });
  }

  req.session.userId = user.id;
  req.session.userName = user.name;

  res.json({ user: { id: user.id, name: user.name, email: user.email } });
}

// POST /api/auth/logout
function logout(req, res) {
  req.session.destroy(() => {
    res.json({ message: 'Logged out.' });
  });
}

// POST /api/auth/forgot-password
async function forgotPassword(req, res) {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });

  if (user) {
    await Token.destroy({ where: { userId: user.id, type: 'password-reset' } });

    const token = await Token.create({
      type: 'password-reset',
      userId: user.id,
      expiresAt: tokenExpiresAt(1),
    });

    await emailService.sendPasswordResetEmail(email, token.id);
  }

  res.json({
    message:
      'If an account with that email exists, a reset link has been sent.',
  });
}

// POST /api/auth/reset-password/:token
async function resetPassword(req, res) {
  const { password, confirmation } = req.body;

  const token = await Token.findOne({
    where: {
      id: req.params.token,
      type: 'password-reset',
      expiresAt: { [Op.gt]: new Date() },
    },
  });

  if (!token) {
    return res
      .status(400)
      .json({ error: 'This reset link is invalid or has expired.' });
  }

  if (password !== confirmation) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  const passwordError = validatePassword(password);

  if (passwordError) {
    return res.status(400).json({ error: passwordError });
  }

  const hashed = await bcrypt.hash(password, 10);

  await User.update({ password: hashed }, { where: { id: token.userId } });
  await token.destroy();

  res.json({ message: 'Password reset successful.' });
}

module.exports = {
  me,
  register,
  activate,
  login,
  logout,
  forgotPassword,
  resetPassword,
};
