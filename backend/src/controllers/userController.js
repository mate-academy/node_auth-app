/* eslint-disable curly */
import { User } from '../models/User.js';
import bcrypt from 'bcrypt';

export const getProfile = async (req, res) => {
  const user = await User.findByPk(req.user.id);

  res.json(user);
};

export const updateName = async (req, res) => {
  const user = await User.findByPk(req.user.id);

  user.name = req.body.name;
  await user.save();

  res.json(user);
};

export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findByPk(req.user.id);

  const ok = await bcrypt.compare(oldPassword, user.password);

  if (!ok) return res.status(400).json({ message: 'Wrong password' });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: 'Password changed' });
};
