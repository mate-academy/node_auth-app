/* eslint-disable no-console */
/* eslint-disable curly */
import { User } from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';
import { sendResetEmail } from '../services/emailService.js';
import bcrypt from 'bcrypt';

export const getProfile = async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = await User.findByPk(req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
  });
};

export const updateName = async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!req.body.name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  const user = await User.findByPk(req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.name = req.body.name;
  await user.save();

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
  });
};

export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password too short' });
  }

  const user = await User.findByPk(req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const ok = await bcrypt.compare(oldPassword, user.password);

  if (!ok) {
    return res.status(400).json({ message: 'Wrong password' });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: 'Password changed' });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.json({ message: 'If user exists, email sent' });
  }

  user.resetToken = uuidv4();
  await user.save();

  await sendResetEmail(user);

  res.json({ message: 'Email sent' });
};

export const resetPassword = async (req, res) => {
  const { token, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  const user = await User.findOne({ where: { resetToken: token } });

  if (!user) {
    return res.status(400).json({ message: 'Invalid token' });
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetToken = null;

  await user.save();

  res.json({ message: 'Password updated' });
};

export const changeEmail = async (req, res) => {
  const { password, newEmail } = req.body;

  const user = await User.findByPk(req.user.id);

  const ok = await bcrypt.compare(password, user.password);

  if (!ok) {
    return res.status(400).json({ message: 'Wrong password' });
  }

  const oldEmail = user.email;

  user.email = newEmail;

  await user.save();

  console.log(`Email changed from ${oldEmail}`);

  res.json({ message: 'Email updated' });
};
