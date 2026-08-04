import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { userService } from '../services/user.service.js';
import { tokenService } from '../services/token.service.js';
import { emailService } from '../services/email.service.js';
import { ApiError } from '../exeptions/api.error.js';
import {
  normalizeEmail,
  validateEmail,
  validateName,
  validatePassword,
} from '../utils/validation.js';

function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };
}

const getProfile = async (req, res) => {
  const user = await userService.findById(req.user.id);

  if (!user) {
    throw ApiError.unauthorized();
  }

  res.send({
    user: userService.normalize(user),
  });
};

const updateName = async (req, res) => {
  const { name } = req.body;

  const nameError = validateName(name);

  if (nameError) {
    throw ApiError.badRequest('Bad request', {
      name: nameError,
    });
  }

  const user = await userService.findById(req.user.id);

  if (!user) {
    throw ApiError.unauthorized();
  }

  user.name = name.trim();

  await user.save();

  res.send({
    message: 'Name was changed successfully',
    user: userService.normalize(user),
  });
};

const updatePassword = async (req, res) => {
  const { oldPassword, newPassword, passwordConfirmation } = req.body;

  const errors = {
    oldPassword: !oldPassword ? 'Old password is required' : undefined,

    newPassword: validatePassword(newPassword),

    passwordConfirmation: !passwordConfirmation
      ? 'Password confirmation is required'
      : undefined,
  };

  if (errors.oldPassword || errors.newPassword || errors.passwordConfirmation) {
    throw ApiError.badRequest('Bad request', errors);
  }

  if (newPassword !== passwordConfirmation) {
    throw ApiError.badRequest('Bad request', {
      passwordConfirmation: 'Passwords do not match',
    });
  }

  const user = await userService.findById(req.user.id);

  if (!user) {
    throw ApiError.unauthorized();
  }

  const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isOldPasswordValid) {
    throw ApiError.badRequest('Bad request', {
      oldPassword: 'Old password is incorrect',
    });
  }

  const isSamePassword = await bcrypt.compare(newPassword, user.password);

  if (isSamePassword) {
    throw ApiError.badRequest('Bad request', {
      newPassword: 'New password must be different from the old password',
    });
  }

  user.password = await bcrypt.hash(newPassword, 10);

  await user.save();

  await tokenService.remove(user.id);

  res.clearCookie('refreshToken', getRefreshCookieOptions());

  res.send({
    message: 'Password was changed successfully. Please log in again.',
    redirectUrl: '/login',
  });
};

const requestEmailChange = async (req, res) => {
  const { newEmail, password } = req.body;

  const errors = {
    newEmail: validateEmail(newEmail),
    password: !password ? 'Password is required' : undefined,
  };

  if (errors.newEmail || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const normalizedNewEmail = normalizeEmail(newEmail);

  const user = await userService.findById(req.user.id);

  if (!user) {
    throw ApiError.unauthorized();
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Bad request', {
      password: 'Password is incorrect',
    });
  }

  if (normalizedNewEmail === normalizeEmail(user.email)) {
    throw ApiError.badRequest('Bad request', {
      newEmail: 'New email must be different from the current email',
    });
  }

  const existingUser = await userService.findByEmail(normalizedNewEmail);

  if (existingUser) {
    throw ApiError.badRequest('Bad request', {
      newEmail: 'This email is already in use',
    });
  }

  const emailChangeToken = uuidv4();

  user.pendingEmail = normalizedNewEmail;
  user.emailChangeToken = emailChangeToken;
  user.emailChangeTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await user.save();

  try {
    await emailService.sendEmailChangeConfirmation(
      normalizedNewEmail,
      emailChangeToken,
    );
  } catch (error) {
    user.pendingEmail = null;
    user.emailChangeToken = null;
    user.emailChangeTokenExpiresAt = null;

    await user.save();

    throw error;
  }

  res.send({
    message: 'Confirmation email was sent to the new email address.',
  });
};

const confirmEmailChange = async (req, res) => {
  const { token } = req.params;

  const user = await userService.findByEmailChangeToken(token);

  if (!user || !user.pendingEmail || !user.emailChangeTokenExpiresAt) {
    throw ApiError.badRequest(
      'Email confirmation link is invalid or has already been used',
    );
  }

  const tokenExpiresAt = new Date(user.emailChangeTokenExpiresAt).getTime();

  if (tokenExpiresAt < Date.now()) {
    user.pendingEmail = null;
    user.emailChangeToken = null;
    user.emailChangeTokenExpiresAt = null;

    await user.save();

    throw ApiError.badRequest('Email confirmation link has expired');
  }

  const existingUser = await userService.findByEmail(user.pendingEmail);

  if (existingUser && existingUser.id !== user.id) {
    user.pendingEmail = null;
    user.emailChangeToken = null;
    user.emailChangeTokenExpiresAt = null;

    await user.save();

    throw ApiError.badRequest('This email is already in use');
  }

  const oldEmail = user.email;
  const newEmail = user.pendingEmail;

  user.email = newEmail;
  user.pendingEmail = null;
  user.emailChangeToken = null;
  user.emailChangeTokenExpiresAt = null;

  await user.save();

  await tokenService.remove(user.id);

  res.clearCookie('refreshToken', getRefreshCookieOptions());

  await emailService.sendOldEmailNotification(oldEmail, newEmail);

  res.send({
    message: 'Email was changed successfully. Please log in again.',
    user: userService.normalize(user),
    redirectUrl: '/login',
  });
};

export const userController = {
  getProfile,
  updateName,
  updatePassword,
  requestEmailChange,
  confirmEmailChange,
};
