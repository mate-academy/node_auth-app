import { RequestHandler } from 'express';
import * as usersRepository from '../entities/users.repository.js';
import * as userService from '../services/user.service.js';
import * as mailer from '../utils/mailer.js';
import bcrypt from 'bcrypt';

export const getProfile: RequestHandler = async (req, res) => {
  const user = await usersRepository.getById(req.user!.id);

  if (!user) {
    return res.status(404).json({
      message: 'User not found',
    });
  }

  res.json({ user: userService.normalize(user) });
};

export const updateName: RequestHandler = async (req, res) => {
  const { name } = req.body;

  const nameError = userService.validateName(name);

  if (nameError) {
    return res.status(400).json({
      errors: { name: nameError },
      message: 'Validation error',
    });
  }

  const user = await usersRepository.updateName(req.user!.id, name);

  res.json({ user: userService.normalize(user) });
};

export const updatePassword: RequestHandler = async (req, res) => {
  const { oldPassword, newPassword, confirmation } = req.body;

  const user = await usersRepository.getById(req.user!.id);

  if (!user) {
    return res.status(404).json({
      message: 'User not found',
    });
  }

  const isOldPasswordOkay = await bcrypt.compare(oldPassword, user.password);

  if (!isOldPasswordOkay) {
    return res.status(401).json({
      errors: { oldPassword: 'Current password is incorrect' },
      message: 'Validation error',
    });
  }

  const passwordError = userService.validatePassword(newPassword);

  if (passwordError) {
    return res.status(400).json({
      errors: { newPassword: passwordError },
      message: 'Validation error',
    });
  }

  if (newPassword !== confirmation) {
    return res.status(400).json({
      errors: { newPassword: 'Passwords do not match' },
      message: 'Validation error',
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await usersRepository.updatePassword(user.id, hashedPassword);

  res.json({
    message: 'Password updated successfully',
  });
};

export const updateEmail: RequestHandler = async (req, res) => {
  const { password, newEmail } = req.body;

  const user = await usersRepository.getById(req.user!.id);

  if (!user) {
    return res.status(404).json({
      message: 'User not found',
    });
  }

  const isPasswordOkay = await bcrypt.compare(password, user.password);

  if (!isPasswordOkay) {
    return res.status(401).json({
      errors: { password: 'Password is incorrect' },
      message: 'Validation error',
    });
  }

  const emailError = userService.validateEmail(newEmail);

  if (emailError) {
    return res.status(400).json({
      errors: { newEmail: emailError },
      message: 'Validation error',
    });
  }

  const isEmailExist = await usersRepository.getByEmail(newEmail);

  if (isEmailExist) {
    return res.status(400).json({
      errors: { newEmail: 'Email is already taken' },
      message: 'Validation error',
    });
  }

  const oldEmail = user.email;
  const activationToken = crypto.randomUUID();

  await usersRepository.updateEmail(user.id, newEmail, activationToken);

  await mailer.sendActivationLink(newEmail, activationToken);

  await mailer.sendEmailChangeNotification(oldEmail, newEmail);

  res.json({
    message: 'Email changed. Please confirm your new email address',
  });
};
