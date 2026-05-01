import bcrypt from 'bcrypt';
import { v4 as uuid4 } from 'uuid';
import { usersRepository } from '../entity/users.repository.js';
import { userService } from '../services/user.service.js';
import { mailer } from '../utils/mailer.js';

const getProfile = async (req, res) => {
  const { id } = req.user;

  const user = await usersRepository.getById(id);

  if (!user) {
    return res.status(404).json({
      message: 'User not found',
    });
  }

  res.json({ user: userService.normalize(user) });
};

const updateName = async (req, res) => {
  const { name } = req.body;
  const { id } = req.user;

  if (!name) {
    return res.status(400).json({
      errors: { name: 'Name is required' },
      message: 'Validation error',
    });
  }

  const hasNameError = userService.validateName(name);

  if (hasNameError) {
    return res.status(400).json({
      errors: { name: hasNameError },
      message: 'Validation error',
    });
  }

  const user = await usersRepository.getById(id);

  if (!user) {
    return res.status(404).json({
      message: 'User not found',
    });
  }

  if (user.name === name) {
    return res.status(400).json({
      errors: { name: 'New name must be different' },
      message: 'Validation error',
    });
  }

  await usersRepository.updateName(id, name);

  const updatedUser = await usersRepository.getById(id);

  res.json({ user: userService.normalize(updatedUser) });
};

const updatePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmation } = req.body;
  const { id } = req.user;

  const user = await usersRepository.getById(id);

  if (!user) {
    return res.status(404).json({
      message: 'User not found',
    });
  }

  const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isOldPasswordValid) {
    return res.status(401).json({
      errors: { oldPassword: 'Current password is incorrect' },
      message: 'Validation error',
    });
  }

  const hasNewPasswordError = userService.validatePassword(newPassword);

  if (hasNewPasswordError) {
    return res.status(400).json({
      errors: { newPassword: hasNewPasswordError },
      message: 'Validation error',
    });
  }

  if (newPassword !== confirmation) {
    return res.status(400).json({
      errors: { newPassword: 'Passwords do not match' },
      message: 'Validation error',
    });
  }

  const isSamePassword = await bcrypt.compare(newPassword, user.password);

  if (isSamePassword) {
    return res.status(400).json({
      errors: {
        newPassword: 'New password must be different from current password',
      },
      message: 'Validation error',
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await usersRepository.updatePassword(id, hashedPassword);

  res.json({
    message: 'Password updated successfully',
  });
};

const updateEmail = async (req, res) => {
  const { password, newEmail } = req.body;
  const { id } = req.user;

  const user = await usersRepository.getById(id);

  if (!user) {
    return res.status(404).json({
      message: 'User not found',
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({
      errors: { password: 'Password is incorrect' },
      message: 'Validation error',
    });
  }

  const hasNewEmailError = userService.validateEmail(newEmail);

  if (hasNewEmailError) {
    return res.status(400).json({
      errors: { newEmail: hasNewEmailError },
      message: 'Validation error',
    });
  }

  const isEmailExists = await usersRepository.getByEmail(newEmail);

  if (isEmailExists) {
    return res.status(400).json({
      errors: { newEmail: 'Email is already taken' },
      message: 'Validation error',
    });
  }

  const oldEmail = user.email;

  const activationToken = uuid4();

  await usersRepository.updateEmail(id, newEmail, activationToken);

  await mailer.sendActivationLink(newEmail, activationToken);

  await mailer.sendChangeEmailNotification(oldEmail, newEmail);

  res.json({
    message: 'Email changed. Please confirm your new email address',
  });
};

export const profileController = {
  getProfile,
  updateName,
  updatePassword,
  updateEmail,
};
