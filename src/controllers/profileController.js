'use strict';

const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const User = require('../models/User');
const Token = require('../models/Token');
const emailService = require('../services/email');
const { validatePassword } = require('../utils/validation');

function tokenExpiresAt(hours = 1) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

// GET /api/profile
async function getProfile(req, res) {
  const user = await User.findByPk(req.session.userId, {
    attributes: ['id', 'name', 'email'],
  });

  res.json({ user });
}

// PUT /api/profile/name
async function changeName(req, res) {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name cannot be empty.' });
  }

  await User.update(
    { name: name.trim() },
    { where: { id: req.session.userId } },
  );

  req.session.userName = name.trim();
  res.json({ message: 'Name updated successfully.' });
}

// PUT /api/profile/password
async function changePassword(req, res) {
  const { oldPassword, newPassword, confirmation } = req.body;
  const user = await User.findByPk(req.session.userId);

  const valid = await bcrypt.compare(oldPassword, user.password);

  if (!valid) {
    return res.status(400).json({ error: 'Current password is incorrect.' });
  }

  if (newPassword !== confirmation) {
    return res.status(400).json({ error: 'New passwords do not match.' });
  }

  const passwordError = validatePassword(newPassword);

  if (passwordError) {
    return res.status(400).json({ error: passwordError });
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await User.update(
    { password: hashed },
    { where: { id: req.session.userId } },
  );

  res.json({ message: 'Password updated successfully.' });
}

// PUT /api/profile/email
async function requestEmailChange(req, res) {
  const { password, newEmail } = req.body;
  const user = await User.findByPk(req.session.userId);

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return res.status(400).json({ error: 'Password is incorrect.' });
  }

  if (!newEmail || newEmail === user.email) {
    return res
      .status(400)
      .json({ error: 'Please provide a different email address.' });
  }

  const existing = await User.findOne({ where: { email: newEmail } });

  if (existing) {
    return res.status(400).json({ error: 'This email is already in use.' });
  }

  await Token.destroy({ where: { userId: user.id, type: 'email-change' } });

  const token = await Token.create({
    type: 'email-change',
    userId: user.id,
    data: newEmail,
    expiresAt: tokenExpiresAt(1),
  });

  await emailService.sendEmailChangeNotification(
    user.email,
    newEmail,
    token.id,
  );

  res.json({
    message: 'Confirmation email sent. Check your new email address.',
  });
}

// GET /api/profile/confirm-email-change/:token
async function confirmEmailChange(req, res) {
  const token = await Token.findOne({
    where: {
      id: req.params.token,
      type: 'email-change',
      expiresAt: { [Op.gt]: new Date() },
    },
  });

  if (!token) {
    return res
      .status(400)
      .json({ error: 'This link is invalid or has expired.' });
  }

  await User.update({ email: token.data }, { where: { id: token.userId } });
  await token.destroy();

  res.json({ message: 'Email updated successfully.' });
}

module.exports = {
  getProfile,
  changeName,
  changePassword,
  requestEmailChange,
  confirmEmailChange,
};
