import { userService } from '../services/user.service.js';
import bcrypt from 'bcrypt';
import { emailService } from '../services/email.service.js';
import { ApiError } from '../exceptions/api.error.js';

const getAllUsers = async (req, res) => {
  const users = await userService.getAllActive();
  const normalizedUsers = users.map(userService.normalize);

  res.send(normalizedUsers);
};

const changeName = async (req, res) => {
  const { newName } = req.body;
  const { id: userId } = res.locals.user;

  const isNameValid = userService.validateName(newName);

  if (isNameValid) {
    throw ApiError.badRequest('Bad request', isNameValid);
  }

  const user = await userService.getById(userId);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  user.name = newName;
  await user.save();

  res.json({ message: 'Name successfully updated', name: user.name });
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const { id: userId } = res.locals.user;

  const isPasswordValid = userService.validatePassword(newPassword);

  if (isPasswordValid) {
    throw ApiError.badRequest('Bad request', isPasswordValid);
  }

  if (newPassword !== confirmPassword) {
    throw ApiError.badRequest('Passwords do not match');
  }

  const user = await userService.getById(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);

  if (!isMatch) {
    throw ApiError.badRequest('Incorrect old password');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: 'Password successfully changed' });
};

const changeEmail = async (req, res) => {
  const { password, newEmail } = req.body;
  const { id: userId } = res.locals.user;

  const isEmailValid = userService.validatePassword(newEmail);

  if (isEmailValid) {
    throw ApiError.badRequest('Bad request', isEmailValid);
  }

  const user = await userService.getById(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw ApiError.badRequest('Incorrect password');
  }

  const oldEmail = user.email;

  user.email = newEmail;
  await user.save();

  await emailService.sendNewEmailNotification(oldEmail, newEmail);

  res.json({ message: 'Email successfully updated' });
};

export const usersController = {
  getAllUsers,
  changeName,
  changePassword,
  changeEmail,
};
