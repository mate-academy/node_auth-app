import { User } from '../models/index.js';
import { userService } from '../services/user.service.js';
import { ApiError } from '../exeptions/api.error.js';
import bcrypt from 'bcrypt';
import {
  validateName,
  validatePassword,
  validateEmail,
} from '../utils/validation.js';

const updateName = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw ApiError.unauthorized();
  }

  let { name } = req.body;

  if (typeof name === 'string') {
    name = name.trim();
  }

  const nameError = validateName(name);

  if (nameError) {
    throw ApiError.badRequest(nameError);
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
  const userId = req.user?.id;

  if (!userId) {
    throw ApiError.unauthorized();
  }

  const { oldPassword, newPassword, newPasswordConfirm } = req.body;

  if (!oldPassword || !newPassword || !newPasswordConfirm) {
    throw ApiError.badRequest(
      'Old password, new password, and confirmation are required',
    );
  }

  const passwordError = validatePassword(newPassword);

  if (passwordError) {
    throw ApiError.badRequest(passwordError);
  }

  if (newPassword !== newPasswordConfirm) {
    throw ApiError.badRequest('New passwords do not match');
  }

  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
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
  const userId = req.user?.id;

  if (!userId) {
    throw ApiError.unauthorized();
  }

  const { password, newEmail, newEmailConfirm } = req.body;

  if (!newEmail || !newEmailConfirm) {
    throw ApiError.badRequest('New email and confirmation are required');
  }

  if (newEmail.trim() !== newEmailConfirm.trim()) {
    throw ApiError.badRequest('Emails do not match');
  }

  const emailError = validateEmail(newEmail);

  if (emailError) {
    throw ApiError.badRequest(emailError);
  }

  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Password is incorrect');
  }

  if (user.email === newEmail) {
    return res.send({
      message: 'New email is the same as the current email',
      email: user.email,
    });
  }

  user.email = newEmail;
  await user.save();

  res.send({ message: 'Email updated successfully', email: user.email });
};

const getProfile = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw ApiError.unauthorized();
  }

  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  res.send(userService.normalize(user));
};

export const userController = {
  updateName,
  updatePassword,
  updateEmail,
  getProfile,
};
