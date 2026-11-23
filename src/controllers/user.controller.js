import { User } from '../models/user.js';
import { userService } from '../services/user.service.js';
import { ApiError } from '../exceptions/api.error.js';
import bcrypt from 'bcrypt';

const updateName = async (req, res) => {
  const { name } = req.body;

  if (typeof name !== 'string' || !name.trim()) {
    throw ApiError.badRequest('Name is required');
  }

  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw ApiError.unathorized();
  }

  user.name = name.trim();
  await user.save();

  res.send(userService.normalize(user));
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmation } = req.body;

  if (typeof oldPassword !== 'string' || !oldPassword) {
    throw ApiError.badRequest('Old password is required');
  }

  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    throw ApiError.badRequest('New password must be at least 6 characters');
  }

  if (newPassword !== confirmation) {
    throw ApiError.badRequest('Passwords do not match');
  }

  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw ApiError.unathorized();
  }

  const isOldValid = await bcrypt.compare(oldPassword, user.password);

  if (!isOldValid) {
    throw ApiError.badRequest('Old password is incorrect');
  }

  if (oldPassword === newPassword) {
    throw ApiError.badRequest('New password must differ from the old one');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.send({ message: 'OK' });
};

export const userController = { updateName, changePassword };
