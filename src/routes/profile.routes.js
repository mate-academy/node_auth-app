'use strict';

const express = require('express');
const bcrypt = require('bcrypt');
const { auth } = require('../middlewares/auth.js');

const { User } = require('../models/User.js');
const { RefreshSession } = require('../models/RefreshSession.js');
const { validatePassword } = require('../services/password.js');
const { sendEmailChangedNotice } = require('../services/mailer.js');

const profileRouter = express.Router();

profileRouter.get('/', auth, async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: ['id', 'userName', 'email'],
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json(user);
});

profileRouter.patch('/name', auth, async (req, res) => {
  const { name } = req.body || {};

  if (!name) {
    return res.status(400).json({ message: 'name required' });
  }

  const user = await User.findByPk(req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.userName = name;
  await user.save();

  return res.json({ userName: user.userName });
});

profileRouter.patch('/password', auth, async (req, res) => {
  const { oldPassword, newPassword, confirmation } = req.body || {};

  if (!oldPassword || !newPassword || !confirmation) {
    return res
      .status(400)
      .json({ message: 'oldPassword, newPassword, confirmation required' });
  }

  if (newPassword !== confirmation) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  if (!validatePassword(newPassword)) {
    return res.status(400).json({
      message: 'Password must be 8+ chars and contain letters + numbers',
    });
  }

  const user = await User.findByPk(req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const ok = await bcrypt.compare(oldPassword, user.passwordHash);

  if (!ok) {
    return res.status(403).json({ message: 'Old password is incorrect' });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);

  await user.save();
  await RefreshSession.destroy({ where: { userId: user.id } });

  return res.json({ message: 'Password changed successfully' });
});

profileRouter.patch('/email', auth, async (req, res) => {
  const { password, newEmail, confirmNewEmail } = req.body || {};

  if (!password || !newEmail || !confirmNewEmail) {
    return res
      .status(400)
      .json({ message: 'password, newEmail, confirmNewEmail required' });
  }

  if (newEmail !== confirmNewEmail) {
    return res.status(400).json({ message: 'Emails do not match' });
  }

  const user = await User.findByPk(req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);

  if (!ok) {
    return res.status(403).json({ message: 'Password is incorrect' });
  }

  const exists = await User.findOne({ where: { email: newEmail } });

  if (exists) {
    return res.status(409).json({ message: 'Email is already in use' });
  }

  const oldEmail = user.email;

  user.email = newEmail;
  await user.save();

  await sendEmailChangedNotice(oldEmail, newEmail);

  return res.json({ message: 'Email changed successfully' });
});

module.exports = { profileRouter };
