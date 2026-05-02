/* eslint-disable no-console */
/* eslint-disable curly */
import { User } from '../models/User.js';
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
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!req.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!oldPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
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

  res.json({ message: 'Password changed successfully' });
};

export const changeEmail = async (req, res) => {
  const { password, newEmail } = req.body;

  if (!req.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!password || !newEmail) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const user = await User.findByPk(req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const ok = await bcrypt.compare(password, user.password);

  if (!ok) {
    return res.status(400).json({ message: 'Wrong password' });
  }

  if (newEmail === user.email) {
    return res.status(400).json({ message: 'Email is the same' });
  }

  const existing = await User.findOne({ where: { email: newEmail } });

  if (existing) {
    return res.status(400).json({ message: 'Email already in use' });
  }

  const oldEmail = user.email;

  user.email = newEmail;
  await user.save();

  console.log(`Email changed from ${oldEmail} to ${newEmail}`);

  res.json({ message: 'Email updated' });
};
