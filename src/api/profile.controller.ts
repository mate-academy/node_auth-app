import { RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import { usersRepository } from '../entity/users.repository.js';
import { userService } from '../services/user.service.js';
import { mailer } from '../utils/mailer.js';

const getProfile: RequestHandler = async (req, res) => {
  const user = (req as any).userEntity;

  res.json({ user: userService.normalize(user) });
};

const updateName: RequestHandler = async (req, res) => {
  const { name } = req.body;
  const user = (req as any).userEntity;

  const nameError = userService.validateName(name);

  if (nameError) {
    return res.status(400).json({
      errors: { name: nameError },
      message: 'Validation error',
    });
  }

  const updatedUser = await usersRepository.updateName(user.id, name);

  res.json({ user: userService.normalize(updatedUser) });
};

const updatePassword: RequestHandler = async (req, res) => {
  const { oldPassword, newPassword, confirmation } = req.body;
  const user = (req as any).userEntity;

  const errors = {
    oldPassword: userService.validatePassword(oldPassword),
    newPassword: userService.validatePassword(newPassword),
  };

  if (newPassword !== confirmation) {
    errors.newPassword = 'Passwords do not match';
  }

  if (Object.values(errors).some((error) => error)) {
    return res.status(400).json({
      errors,
      message: 'Validation error',
    });
  }

  const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isOldPasswordValid) {
    return res.status(400).json({
      errors: { oldPassword: 'Current password is incorrect' },
      message: 'Validation error',
    });
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

  const updatedUser = await usersRepository.updatePassword(
    user.id,
    hashedPassword,
  );

  res.json({ user: userService.normalize(updatedUser) });
};

const updateEmail: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  const user = (req as any).userEntity;

  const errors = {
    email: userService.validateEmail(email),
    password: userService.validatePassword(password),
  };

  if (Object.values(errors).some((error) => error)) {
    return res.status(400).json({
      errors,
      message: 'Validation error',
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({
      errors: { password: 'Password is incorrect' },
      message: 'Validation error',
    });
  }

  const existingUser = await usersRepository.getByEmail(email);

  if (existingUser && existingUser.id !== user.id) {
    return res.status(400).json({
      errors: { email: 'Email is already taken' },
      message: 'Validation error',
    });
  }

  const oldEmail = user.email;
  const updatedUser = await usersRepository.updateEmail(user.id, email);

  // Send notification to old email
  await mailer.sendEmailChangeNotification(oldEmail, email);

  res.json({ user: userService.normalize(updatedUser) });
};

export const profileController = {
  getProfile,
  updateName,
  updatePassword,
  updateEmail,
};
