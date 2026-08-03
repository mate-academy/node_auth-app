import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { userService } from '../services/user.service.js';
import { tokenService } from '../services/token.service.js';
import { emailService } from '../services/email.service.js';
import { ApiError } from '../exeptions/api.error.js';

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }

  return null;
}

function validatePassword(password) {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 6) {
    return 'Password must be at least 6 characters long';
  }

  return null;
}

function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };
}

const getAllActivated = async (req, res) => {
  const users = await userService.getAllActivated();

  res.send(users.map(userService.normalize));
};

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

  if (!name || !name.trim()) {
    throw ApiError.badRequest('Bad request', {
      name: 'Name is required',
    });
  }

  if (name.trim().length < 2) {
    throw ApiError.badRequest('Bad request', {
      name: 'Name must contain at least 2 characters',
    });
  }

  if (name.trim().length > 50) {
    throw ApiError.badRequest('Bad request', {
      name: 'Name must contain no more than 50 characters',
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

  if (oldPassword === newPassword) {
    throw ApiError.badRequest('Bad request', {
      newPassword: 'New password must be different from the old password',
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

  user.password = await bcrypt.hash(newPassword, 10);

  await user.save();
  await tokenService.remove(user.id);

  res.clearCookie('refreshToken', getRefreshCookieOptions());

  res.send({
    message: 'Password was changed successfully. Please log in again.',
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

  const normalizedNewEmail = newEmail.trim().toLowerCase();

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

  if (normalizedNewEmail === user.email.toLowerCase()) {
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

  if (new Date(user.emailChangeTokenExpiresAt).getTime() < Date.now()) {
    user.pendingEmail = null;
    user.emailChangeToken = null;
    user.emailChangeTokenExpiresAt = null;

    await user.save();

    throw ApiError.badRequest('Email confirmation link has expired');
  }

  const existingUser = await userService.findByEmail(user.pendingEmail);

  if (existingUser && existingUser.id !== user.id) {
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
  });
};

export const userController = {
  getAllActivated,
  getProfile,
  updateName,
  updatePassword,
  requestEmailChange,
  confirmEmailChange,
};
