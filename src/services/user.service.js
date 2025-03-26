'use strict';

import bcrypt from 'bcrypt';
import usersRepository from '../entity/users.repository.js';
import { ApiError } from '../exceptions/api.error.js';
import { v4 as uuidv4 } from 'uuid';
import mailer from '../utils/mailer.js';
import EmailChangeRepository from '../entity/emailChange.repository.js';

const normalize = ({ id, name, email }) => {
  return { id, name, email };
};

const validateEmail = (email) => {
  const emailPattern = /^[\w.+-]+@([\w-]+\.)+[a-z]{2,}$/i;

  if (!email) {
    return 'Email is required';
  }

  if (!emailPattern.test(email)) {
    return 'Invalid email';
  }
};

const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
};

const validateUserName = (name) => {
  if (name && name.length < 3) {
    return 'Name must be at least 3 characters';
  }

  if (name && name.length > 50) {
    return 'Name must be at most 50 characters';
  }
};

const validateRequiredName = (name) => {
  if (!name) {
    return 'Name is required';
  }

  return validateUserName(name);
};

const validateCredentials = async ({ email, password, name }) => {
  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
    name: validateUserName(name),
  };

  if (Object.values(errors).some((error) => error)) {
    throw ApiError.badRequest('Validation Error', errors);
  }
};

const getHashedPassword = async (password) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  return hashedPassword;
};

export const register = async ({ email, password, name }) => {
  const activationToken = uuidv4();

  await validateCredentials({ email, password, name });

  const existUser = await usersRepository.findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exists', {
      email: 'User with this email already exists',
    });
  }

  const hashedPassword = await getHashedPassword(password);

  const user = await usersRepository.create({
    name,
    email,
    activationToken,
    password: hashedPassword,
  });

  await mailer.sendActivationLink(email, activationToken);

  return user;
};

const activate = async ({ email, activationToken }) => {
  const user = await usersRepository.findByEmail(email);

  if (!user) {
    throw ApiError.notFound({ email: 'No such user with this email' });
  }

  if (user.activationToken !== activationToken) {
    throw ApiError.notFound({ token: 'No such user with this token' });
  }

  await usersRepository.activate(email);

  return user;
};

const login = async ({ email, password }) => {
  await validateCredentials({ email, password });

  const user = await usersRepository.findByEmail(email);
  const isPasswordCorrect = await bcrypt.compare(
    password,
    user?.password || '',
  );

  if (!user || !isPasswordCorrect) {
    throw ApiError.unauthorized({ message: 'Invalid credentials' });
  }

  if (user.activationToken) {
    throw ApiError.unauthorized({
      message: 'Account is not activated. Please check your email to activate',
    });
  }

  return user;
};

const changeNameByEmail = async (email, name) => {
  const user = await usersRepository.findByEmail(email);

  if (!user) {
    throw ApiError.notFound({ email: 'No such user with this email' });
  }

  const errors = {
    name: validateUserName(name),
  };

  if (Object.values(errors).some((error) => error)) {
    throw ApiError.badRequest('Validation error', errors);
  }

  user.name = name;

  await user.save();

  return user;
};

const changePasswordByEmail = async (
  email,
  { oldPassword, newPassword, confirmPassword },
) => {
  const user = await usersRepository.findByEmail(email);

  if (!user) {
    throw ApiError.notFound({ email: 'No such user with this email' });
  }

  const errors = {
    oldPassword: validatePassword(oldPassword),
    newPassword: validatePassword(newPassword),
    confirmPassword: validatePassword(confirmPassword),
  };

  if (Object.values(errors).some((error) => error)) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password);

  if (!isOldPasswordCorrect) {
    throw ApiError.unauthorized({ oldPassword: 'Old password is not correct' });
  }

  if (newPassword === oldPassword) {
    throw ApiError.badRequest('Bad change-password request', {
      newPassword: 'New password is the same as old password',
    });
  }

  if (newPassword !== confirmPassword) {
    throw ApiError.badRequest('Bad confirmation request', {
      confirmPassword: 'Confirm password is different from new password',
    });
  }

  user.password = await getHashedPassword(newPassword);

  await user.save();

  return user;
};

const resetPassword = async (email, { newPassword, confirmPassword }) => {
  const user = await usersRepository.findByEmail(email);

  if (!user) {
    throw ApiError.notFound({ email: 'No such user with this email' });
  }

  const errors = {
    newPassword: validatePassword(newPassword),
    confirmPassword: validatePassword(confirmPassword),
  };

  if (Object.values(errors).some((error) => error)) {
    throw ApiError.badRequest('Validation error', errors);
  }

  if (newPassword !== confirmPassword) {
    throw ApiError.badRequest('Bad confirmation request', {
      confirmPassword: 'Confirm password is different from new password',
    });
  }

  user.password = await getHashedPassword(newPassword);

  await user.save();

  await mailer.sendPasswordChangedNotification(email);

  return user;
};

const requestChangeEmail = async (email, { newEmail, password }) => {
  const user = await usersRepository.findByEmail(email);

  if (!user) {
    throw ApiError.notFound({ email: 'No such user with this email' });
  }

  const errors = {
    newEmail: validateEmail(newEmail),
    password: validatePassword(password),
  };

  if (Object.values(errors).some((error) => error)) {
    throw ApiError.badRequest('Validation error', errors);
  }

  if (newEmail === email) {
    throw ApiError.badRequest('Bad change-email request', {
      newEmail: 'New email is the same as old email',
    });
  }

  const existUser = await usersRepository.findByEmail(newEmail);

  if (existUser) {
    throw ApiError.badRequest('User already exists', {
      email: 'User with this email already exists',
    });
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throw ApiError.unauthorized({ password: 'Password is not correct' });
  }

  const changeEmailToken = uuidv4();

  await EmailChangeRepository.updateOrCreate({
    email: newEmail,
    userId: user.id,
    token: changeEmailToken,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  });

  await mailer.sendAttemptToChangeEmail(email, newEmail);
  await mailer.sendChangeEmailConfiramtion(newEmail, changeEmailToken);
};

const changeEmail = async (userId, newEmail) => {
  const user = await usersRepository.findById(userId);

  if (!user) {
    throw ApiError.notFound({ id: 'No user with this id' });
  }

  user.email = newEmail;
  await user.save();

  return user;
};

export const userService = {
  normalize,
  validateEmail,
  validatePassword,
  validateRequiredName,
  validateUserName,
  validateCredentials,
  register,
  activate,
  login,
  changeNameByEmail,
  changePasswordByEmail,
  resetPassword,
  requestChangeEmail,
  changeEmail,
};

export default userService;
