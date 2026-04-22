/* eslint-disable indent */
'use strict';

const bcrypt = require('bcryptjs');
const { col, fn, where } = require('sequelize');

const { User } = require('../models/user.model');
const { SocialAccount } = require('../models/socialAccount.model');
const { ApiError } = require('../utils/ApiError');
const {
  validatePassword,
  validateName,
  validateEmail,
} = require('../utils/validate');
const jwtService = require('./jwt.service');
const mailService = require('./mail.service');

function normalize(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    hasPassword: Boolean(user.password),
    socialAccounts: Array.isArray(user.socialAccounts)
      ? user.socialAccounts.map((socialAccount) => ({
          provider: socialAccount.provider,
        }))
      : [],
  };
}

function findByEmail(email, options = {}) {
  return User.findOne({ where: { email }, ...options });
}

function findByEmailCaseInsensitive(email, options = {}) {
  return User.findOne({
    where: where(fn('lower', col('email')), String(email).trim().toLowerCase()),
    ...options,
  });
}

function findByActivationToken(activationToken, options = {}) {
  return User.findOne({ where: { activationToken }, ...options });
}

function findById(id, options = {}) {
  return User.findByPk(id, options);
}

async function getProfile(userId) {
  const user = await findById(userId, {
    include: [
      {
        model: SocialAccount,
        as: 'socialAccounts',
      },
    ],
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return normalize(user);
}

async function changePassword({ userId, oldPassword, newPassword }) {
  const user = await findById(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const errors = {};
  const requiresCurrentPassword = Boolean(user.password);

  if (requiresCurrentPassword && !oldPassword) {
    errors.oldPassword = 'Old password is required';
  }

  const newPasswordError = validatePassword(newPassword);

  if (newPasswordError) {
    errors.newPassword = newPasswordError;
  }

  if (Object.keys(errors).length > 0) {
    throw ApiError.badRequest('Validation failed', errors);
  }

  if (requiresCurrentPassword) {
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      throw ApiError.badRequest('Validation failed', {
        oldPassword: 'Old password is incorrect',
      });
    }
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return requiresCurrentPassword
    ? 'Password changed successfully.'
    : 'Password set successfully.';
}

async function changeName({ userId, newName }) {
  const nameError = validateName(newName);

  if (nameError) {
    throw ApiError.badRequest('Validation failed', { newName: nameError });
  }

  const user = await findById(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  user.name = String(newName).trim();
  await user.save();
}

async function requestEmailChange({ userId, password, newEmail }) {
  const user = await findById(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (!user.password) {
    throw ApiError.badRequest(
      'Set a password before changing your email address.',
      {
        password: 'Set a password before changing your email address.',
      },
    );
  }

  const errors = {};
  const normalizedEmail = String(newEmail).trim();

  if (!password) {
    errors.password = 'Password is required';
  }

  const emailError = validateEmail(normalizedEmail);

  if (emailError) {
    errors.newEmail = emailError;
  }

  if (Object.keys(errors).length > 0) {
    throw ApiError.badRequest('Validation failed', errors);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Validation failed', {
      password: 'Password is incorrect',
    });
  }

  if (user.email.toLowerCase() === normalizedEmail.toLowerCase()) {
    throw ApiError.badRequest('Validation failed', {
      newEmail: 'New email must be different from current email',
    });
  }

  const existingUser = await findByEmail(normalizedEmail);

  if (existingUser && existingUser.id !== user.id) {
    throw ApiError.badRequest('Validation failed', {
      newEmail: 'Email is already taken',
    });
  }

  const token = jwtService.signEmailChangeToken({
    type: 'email-change',
    userId: user.id,
    currentEmail: user.email,
    newEmail: normalizedEmail,
  });

  await mailService.sendEmailChangeConfirmation(normalizedEmail, token);
}

async function confirmEmailChange(token) {
  const payload = jwtService.verifyEmailChangeToken(token);

  if (!payload || payload.type !== 'email-change') {
    throw ApiError.notFound('Invalid email change token');
  }

  const user = await findById(payload.userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (user.email !== payload.currentEmail) {
    throw ApiError.badRequest('Email change request is no longer valid');
  }

  const existingUser = await findByEmail(payload.newEmail);

  if (existingUser && existingUser.id !== user.id) {
    throw ApiError.badRequest('Validation failed', {
      newEmail: 'Email is already taken',
    });
  }

  const oldEmail = user.email;

  user.email = payload.newEmail;
  await user.save();

  await mailService.sendEmailChangeNotification(oldEmail, payload.newEmail);

  return user;
}

module.exports = {
  normalize,
  findByEmail,
  findByEmailCaseInsensitive,
  findByActivationToken,
  findById,
  getProfile,
  changePassword,
  changeName,
  requestEmailChange,
  confirmEmailChange,
};
