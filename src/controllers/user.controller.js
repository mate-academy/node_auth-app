/* eslint-disable max-len */

import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import { ApiError } from '../exceptions/api.error.js';
import { userService } from '../services/user.service.js';
import { emailService } from '../services/email.service.js';
import { tokenService } from '../services/token.service.js';

async function getAll(_req, res) {
  const users = await userService.getAllActive();

  const normalizeUsers = users.map(userService.normalize);

  res.send(normalizeUsers);
}

async function updateName(req, res) {
  const { name } = req.body;
  const userId = req.user.id;

  const nameError = userService.validateName(name);

  if (nameError) {
    throw ApiError.BadRequest(nameError);
  }

  const updatedUser = await userService.updateName(userId, name);

  res.status(200).json({
    message: 'Name successfully updated',
    user: userService.normalize(updatedUser),
  });
}

async function changePassword(req, res) {
  const { oldPassword, newPassword, confirmation } = req.body;
  const userId = req.user.id;

  if (!oldPassword || !newPassword || !confirmation) {
    throw ApiError.BadRequest(
      'Old, new passwords and confirmation are required',
    );
  }

  if (newPassword !== confirmation) {
    throw ApiError.BadRequest('New passwords do not match');
  }

  const passwordError = userService.validatePassword(newPassword);

  if (passwordError) {
    throw ApiError.BadRequest(passwordError);
  }

  const user = await userService.getById(userId);

  if (!user) {
    throw ApiError.Unauthorized();
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Old password is wrong');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const updatedUser = await userService.updatePassword(userId, hashedPassword);

  res.status(200).json({
    message: 'Password successfully changed',
    user: userService.normalize(updatedUser),
  });
}

async function changeEmail(req, res) {
  const { newEmail, password } = req.body;
  const userId = req.user.id;

  if (!newEmail || !password) {
    throw ApiError.BadRequest('New email and password are required');
  }

  const emailError = userService.validateEmail(newEmail);

  if (emailError) {
    throw ApiError.BadRequest(emailError);
  }

  const user = await userService.getById(userId);

  if (!user) {
    throw ApiError.Unauthorized();
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Wrong password');
  }

  const existingUser = await userService.getByEmail(newEmail);

  if (existingUser) {
    throw ApiError.BadRequest('This email is already taken');
  }

  const newActivationToken = randomUUID();

  await userService.updateEmail(userId, newEmail, newActivationToken);
  await emailService.sendEmailChangeNotice(user.email);
  await emailService.sendActivationLink(newEmail, newActivationToken);
  await tokenService.remove(userId);

  res.clearCookie('refreshToken');

  res.status(200).json({
    message:
      'Email successfully changed. Please check your new email to activate your account. You have been logged out.',
  });
}

export const userController = {
  getAll,
  updateName,
  changePassword,
  changeEmail,
};
