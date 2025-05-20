/* eslint-disable no-console */
const User = require('../models/User');
const bcrypt = require('bcrypt');
const sendMail = require('../utils/sendMail');

const getProfile = async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: ['id', 'name', 'email'],
  });

  res.json(user);
};

const updateName = async (req, res) => {
  const { name } = req.body;
  const user = await User.findByPk(req.user.id);

  user.name = name;
  await user.save();

  res.json({ message: 'Name updated successfully' });
};

const updatePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  const user = await User.findByPk(req.user.id);
  const isMatch = await bcrypt.compare(oldPassword, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid old password' });
  }

  const password = await bcrypt.hash(newPassword, 10);

  user.password = password;
  await user.save();

  return res.json({ message: 'Password updated successfully' });
};

const updateEmail = async (req, res) => {
  const { password, newEmail, confirmEmail } = req.body;

  if (newEmail !== confirmEmail) {
    return res.status(400).json({ message: 'Emails do not match' });
  }

  const existingEmail = await User.findOne({ where: { newEmail } });

  if (existingEmail) {
    return res.status(400).json({ message: 'This email already exists' });
  }

  const user = await User.findByPk(req.user.id);
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid password' });
  }

  await sendMail(
    user.email,
    'Email Change Notification',
    `Your email was changed to ${newEmail}.`,
  );

  user.email = newEmail;
  await user.save();

  res.json({ message: 'Email updated successfully' });
};

module.exports = {
  getProfile,
  updateName,
  updatePassword,
  updateEmail,
};
