import bcrypt from 'bcrypt';

import { ApiError } from '../exceptions/apiError.js';
import { userService } from '../services/userService.js';
import { validators } from '../utils/validators.js';
import { emailService } from '../services/emailService.js';

const getAllActivated = async (req, res) => {
  const users = await userService.getAllActivated();

  res.send(users.map(userService.normalize));
};

const changeName = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const user = await userService.isAuthenticated(id);

  if (!user) {
    throw ApiError.unauthorized();
  }

  if (!name) {
    throw ApiError.badRequest('Invalid name');
  }

  user.name = name;
  await user.save();

  res.send({ message: 'Name updated successfully' });
};

const changePassword = async (req, res) => {
  const { id } = req.params;
  const { password, newPassword, confirmation } = req.body;

  const user = await userService.isAuthenticated(id);

  const errors = {
    password: validators.validatePassword(password),
    newPassword: validators.validatePassword(newPassword),
    confirmation: validators.validatePassword(confirmation),
  };

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  if (!user) {
    throw ApiError.unauthorized();
  }

  if (errors.password || errors.newPassword || errors.confirmation) {
    throw ApiError.badRequest('Validation error', errors);
  }

  if (password === newPassword) {
    throw ApiError.badRequest('Old and new passwords are the same');
  }

  if (newPassword !== confirmation) {
    throw ApiError.badRequest('Passwords do not match');
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedNewPassword;
  await user.save();

  res.send({ message: 'Password updated successfully' });
};

const changeEmail = async (req, res) => {
  const { id } = req.params;
  const { password, newEmail } = req.body;

  const user = await userService.isAuthenticated(id);
  const oldEmail = user.email;

  const errors = {
    email: validators.validateEmail(newEmail),
  };

  if (!user) {
    throw ApiError.unauthorized();
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  if (errors.email) {
    throw ApiError.badRequest('Validation error', errors.email);
  }

  user.email = newEmail;
  await user.save();
  await emailService.sendNotification(oldEmail, newEmail);
  res.send({ message: 'Email updated successfully' });
}

export const userController = {
  getAllActivated,
  changeName,
  changePassword,
  changeEmail,
};
