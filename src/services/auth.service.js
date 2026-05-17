'use strict';

import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/index.js';
import * as passwordService from './password.service.js';
import * as emailService from './email.service.js';

export const register = async ({ name, email, password }) => {
  const existing = await User.findOne({ where: { email } });

  if (existing) {
    throw Object.assign(new Error('Email is already in use'), { status: 409 });
  }

  const passwordErrors = passwordService.validate(password);

  if (passwordErrors.length) {
    throw Object.assign(new Error('Invalid password'), {
      status: 400,
      errors: passwordErrors,
    });
  }

  const hashedPassword = await passwordService.hash(password);
  const activationToken = uuidv4();

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    activationToken,
  });

  try {
    await emailService.sendActivation(email, activationToken);
  } catch (emailErr) {
    throw new Error(emailErr.message);
  }

  return user;
};

export const activate = async (token) => {
  const user = await User.findOne({ where: { activationToken: token } });

  if (!user) {
    throw Object.assign(new Error('Invalid activation token'), { status: 400 });
  }

  user.isActive = true;
  user.activationToken = null;
  await user.save();

  return user;
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  }

  const isValid = await passwordService.compare(password, user.password);

  if (!isValid) {
    throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  }

  if (!user.isActive) {
    throw Object.assign(
      new Error('Please activate your account via the email we sent you'),
      { status: 403 },
    );
  }

  return user;
};

export const requestPasswordReset = async (email) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return;
  }

  const resetToken = uuidv4();
  const expiry = new Date(Date.now() + 60 * 60 * 1000);

  user.passwordResetToken = resetToken;
  user.passwordResetExpiry = expiry;
  await user.save();

  try {
    await emailService.sendPasswordReset(email, resetToken);
  } catch (emailErr) {
    throw new Error(emailErr.message);
  }
};

export const resetPassword = async ({ token, password, confirmation }) => {
  if (password !== confirmation) {
    throw Object.assign(new Error('Passwords do not match'), { status: 400 });
  }

  const passwordErrors = passwordService.validate(password);

  if (passwordErrors.length) {
    throw Object.assign(new Error('Invalid password'), {
      status: 400,
      errors: passwordErrors,
    });
  }

  const user = await User.findOne({ where: { passwordResetToken: token } });

  if (!user) {
    throw Object.assign(new Error('Invalid or expired reset token'), {
      status: 400,
    });
  }

  if (user.passwordResetExpiry < new Date()) {
    throw Object.assign(new Error('Reset token has expired'), { status: 400 });
  }

  user.password = await passwordService.hash(password);
  user.passwordResetToken = null;
  user.passwordResetExpiry = null;
  await user.save();
};

export const confirmEmailChange = async (token) => {
  const user = await User.findOne({ where: { emailChangeToken: token } });

  if (!user || !user.pendingEmail) {
    throw Object.assign(new Error('Invalid email change token'), {
      status: 400,
    });
  }

  const oldEmail = user.email;

  user.email = user.pendingEmail;
  user.pendingEmail = null;
  user.emailChangeToken = null;
  await user.save();

  try {
    await emailService.sendEmailChangeNotice(oldEmail);
  } catch (emailErr) {
    throw new Error(emailErr.message);
  }

  return user;
};
