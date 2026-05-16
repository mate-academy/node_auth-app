import { AppError } from '../../errors/AppError.js';
import { mailer } from '../../utils/mailer.js';
import {
  comparePasswords,
  hashPassword,
  validatePassword,
} from '../../utils/password.js';
import { generateToken } from '../../utils/token.js';
import { usersRepository } from '../users/users.repository.js';
import { usersService, type NormalizedUser } from '../users/users.service.js';

const getProfile = async (userId: number): Promise<NormalizedUser> => {
  const user = await usersRepository.findById(userId);

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return usersService.normalize(user);
};

const updateName = async (
  userId: number,
  name: unknown,
): Promise<NormalizedUser> => {
  if (typeof name !== 'string' || name.trim() === '') {
    throw new AppError(400, 'Name is required');
  }

  const updatedUser = await usersRepository.updateName(userId, name.trim());

  return usersService.normalize(updatedUser);
};

const changePassword = async (
  userId: number,
  input: unknown,
): Promise<void> => {
  if (typeof input !== 'object' || input === null) {
    throw new AppError(400, 'Invalid input');
  }

  const { oldPassword, newPassword, confirmation } = input as {
    oldPassword?: unknown;
    newPassword?: unknown;
    confirmation?: unknown;
  };

  if (typeof oldPassword !== 'string' || oldPassword.trim() === '') {
    throw new AppError(400, 'Old password is required');
  }

  if (typeof newPassword !== 'string' || newPassword.trim() === '') {
    throw new AppError(400, 'New password is required');
  }

  if (typeof confirmation !== 'string' || confirmation.trim() === '') {
    throw new AppError(400, 'Password confirmation is required');
  }

  if (newPassword !== confirmation) {
    throw new AppError(400, 'Password confirmation does not match');
  }

  const passwordValidation = validatePassword(newPassword);

  if (!passwordValidation.isValid) {
    throw new AppError(400, 'Validation failed', {
      newPassword: passwordValidation.errors,
    });
  }

  const user = await usersRepository.findById(userId);

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const isOldPasswordValid = await comparePasswords(
    oldPassword,
    user.passwordHash,
  );

  if (!isOldPasswordValid) {
    throw new AppError(400, 'Old password is incorrect');
  }

  const newPasswordHash = await hashPassword(newPassword);

  await usersRepository.updatePassword(userId, newPasswordHash);
};

const changeEmail = async (userId: number, input: unknown): Promise<void> => {
  if (typeof input !== 'object' || input === null) {
    throw new AppError(400, 'Invalid input');
  }

  const { newEmail, password } = input as {
    newEmail?: unknown;
    password?: unknown;
  };

  if (typeof newEmail !== 'string' || newEmail.trim() === '') {
    throw new AppError(400, 'New email is required');
  }

  if (typeof password !== 'string' || password.trim() === '') {
    throw new AppError(400, 'Password is required');
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.)+[\w-]{2,}$/;
  const normalizedEmail = newEmail.trim().toLowerCase();

  if (!emailPattern.test(normalizedEmail)) {
    throw new AppError(400, 'Invalid email format');
  }

  const user = await usersRepository.findById(userId);

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  if (user.email === normalizedEmail) {
    throw new AppError(400, 'New email must be different from current email');
  }

  const isPasswordValid = await comparePasswords(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError(400, 'Password is incorrect');
  }

  const existingUser = await usersRepository.findByEmail(normalizedEmail);

  if (existingUser) {
    throw new AppError(409, 'Email is already in use');
  }

  const emailChangeToken = generateToken();

  await usersRepository.setEmailChangeData(
    userId,
    normalizedEmail,
    emailChangeToken,
  );

  await mailer.sendEmailChangeConfirmation(normalizedEmail, emailChangeToken);
  await mailer.sendEmailChangeNotification(user.email, normalizedEmail);
};

const confirmEmailChange = async (token: string): Promise<NormalizedUser> => {
  if (!token.trim()) {
    throw new AppError(400, 'Email change token is required');
  }

  const user = await usersRepository.findByEmailChangeToken(token);

  if (!user || !user.pendingEmail) {
    throw new AppError(404, 'Invalid email change token');
  }

  const existingUser = await usersRepository.findByEmail(user.pendingEmail);

  if (existingUser) {
    throw new AppError(409, 'Email is already in use');
  }

  const updatedUser = await usersRepository.confirmEmailChange(
    user.id,
    user.pendingEmail,
  );

  return usersService.normalize(updatedUser);
};

export const profileService = {
  updateName,
  getProfile,
  changePassword,
  changeEmail,
  confirmEmailChange,
};
