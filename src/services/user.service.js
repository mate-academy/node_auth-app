'use strict';

import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/index.js';
import * as passwordService from './password.service.js';
import * as emailService from './email.service.js';

export const getProfile = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: ['id', 'name', 'email'],
  });

  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  return user;
};

export const changeName = async (userId, name) => {
  if (!name || !name.trim()) {
    throw Object.assign(new Error('Name is required'), { status: 400 });
  }

  const user = await User.findByPk(userId);

  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  user.name = name.trim();
  await user.save();

  return user;
};

export const changePassword = async (
  userId,
  { oldPassword, newPassword, confirmation },
) => {
  if (newPassword !== confirmation) {
    throw Object.assign(new Error('Passwords do not match'), { status: 400 });
  }

  const passwordErrors = passwordService.validate(newPassword);

  if (passwordErrors.length) {
    throw Object.assign(new Error('Invalid password'), {
      status: 400,
      errors: passwordErrors,
    });
  }

  const user = await User.findByPk(userId);

  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const isValid = await passwordService.compare(oldPassword, user.password);

  if (!isValid) {
    throw Object.assign(new Error('Old password is incorrect'), {
      status: 400,
    });
  }

  user.password = await passwordService.hash(newPassword);
  await user.save();
};

export const changeEmail = async (userId, { password, newEmail }) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const isValid = await passwordService.compare(password, user.password);

  if (!isValid) {
    throw Object.assign(new Error('Password is incorrect'), { status: 400 });
  }

  const existing = await User.findOne({ where: { email: newEmail } });

  if (existing) {
    throw Object.assign(new Error('Email is already in use'), { status: 409 });
  }

  const emailChangeToken = uuidv4();

  user.pendingEmail = newEmail;
  user.emailChangeToken = emailChangeToken;
  await user.save();

  try {
    await emailService.sendActivation(newEmail, emailChangeToken);
    await emailService.sendEmailChangeNotice(user.email);
  } catch (emailErr) {
    throw new Error(emailErr.message);
  }
};
