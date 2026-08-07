'use strict';

const bcrypt = require('bcryptjs');

const User = require('../models/User');
const { sendEmailChangeNotification } = require('../services/emailService');

async function getProfile(req, res) {
  const user = await User.findByPk(req.user.id);

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    isActive: user.isActive,
  });
}

async function updateName(req, res) {
  const { name } = req.body;
  const user = await User.findByPk(req.user.id);

  user.name = name;
  await user.save();

  res.json({ id: user.id, name: user.name, email: user.email });
}

async function updatePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findByPk(req.user.id);
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordValid) {
    res.status(401).json({ message: 'Current password is incorrect' });

    return;
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: 'Password updated successfully' });
}

async function updateEmail(req, res) {
  const { email, emailConfirmation, password } = req.body;

  if (email !== emailConfirmation) {
    res.status(400).json({ message: 'Confirmation must match the new email' });

    return;
  }

  const user = await User.findByPk(req.user.id);
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    res.status(401).json({ message: 'Password is incorrect' });

    return;
  }

  const existingUser = await User.findOne({ where: { email } });

  if (existingUser && existingUser.id !== user.id) {
    res.status(409).json({ message: 'This email is already taken' });

    return;
  }

  const oldEmail = user.email;

  user.email = email;
  await user.save();

  await sendEmailChangeNotification(oldEmail, email);

  res.json({ id: user.id, name: user.name, email: user.email });
}

module.exports = {
  getProfile,
  updateName,
  updatePassword,
  updateEmail,
};
