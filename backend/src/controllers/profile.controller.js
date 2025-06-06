import { ApiError } from '../exeptions/api.error.js';
import { User } from '../models/user.js';
import bcrypt from 'bcrypt';
import {
  validateEmail,
  validateName,
  validatePassword,
} from '../utils/validation.utils.js';
import { emailService } from '../services/email.service.js';

const updateName = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;

  if (!name || name.length < 3) {
    throw ApiError.badRequest('Name must be at least 3 characters long');
  }

  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  user.name = name;
  await user.save();

  res.send({ message: 'Name updated successfully', name: user.name });
};

const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!newPassword || newPassword.length < 6) {
    throw ApiError.badRequest(
      'New password must be at least 6 characters long',
    );
  }

  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (!user.password) {
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.send({ message: 'Password set successfully' });
  }

  const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isOldPasswordValid) {
    throw ApiError.badRequest('Old password is incorrect');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.send({ message: 'Password updated successfully' });
};

const updateEmail = async (req, res) => {
  const { password, newEmail } = req.body;
  const userId = req.user.id;

  const errors = {
    email: validateEmail(newEmail),
  };

  if (!newEmail || errors.email) {
    throw ApiError.badRequest('Invalid email', errors);
  }

  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Password is incorrect');
  }

  const existingUser = await User.findOne({ where: { email: newEmail } });

  if (existingUser) {
    throw ApiError.badRequest('Email is already in use');
  }

  const oldEmail = user.email;
  user.email = newEmail;
  await user.save();

  await emailService.sendResetEmail(oldEmail, newEmail);

  res.send({ message: 'Email updated successfully' });
};

export const profileController = {
  updateName,
  updatePassword,
  updateEmail,
};
