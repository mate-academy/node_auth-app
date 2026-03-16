'use strict';

const bcrypt = require('bcryptjs');

const User = require('../models/User.model');
const { validatePassword } = require('../utils/password.utils');
const tokenService = require('./token.service');
const emailService = require('./email.service');
const { NODE_ENV } = require('../config/env');

const SALT_ROUNDS = 12;

// ── Get profile ──────────────────────────────────────────────────────────────

function getProfile(userId) {
  const user = User.findById(userId);

  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  return { user: User.toPublic(user) };
}

// ── Update name ──────────────────────────────────────────────────────────────

function updateName(userId, { name }) {
  if (!name || !name.trim()) {
    throw Object.assign(new Error('Name is required'), { status: 400 });
  }

  if (name.trim().length < 2) {
    // eslint-disable-next-line
    throw Object.assign(new Error('Name must be at least 2 characters'), {
      status: 400,
    });
  }

  const updated = User.update(userId, { name: name.trim() });

  return { message: 'Name updated successfully', user: User.toPublic(updated) };
}

// ── Change password ──────────────────────────────────────────────────────────

async function changePassword(
  userId,
  { currentPassword, newPassword, confirmation },
) {
  if (!currentPassword || !newPassword || !confirmation) {
    throw Object.assign(new Error('All fields are required'), { status: 400 });
  }

  const user = User.findById(userId);

  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const match = await bcrypt.compare(currentPassword, user.password);

  if (!match) {
    // eslint-disable-next-line
    throw Object.assign(new Error('Current password is incorrect'), {
      status: 401,
    });
  }

  if (newPassword !== confirmation) {
    // eslint-disable-next-line
    throw Object.assign(new Error('New passwords do not match'), {
      status: 400,
    });
  }

  if (newPassword === currentPassword) {
    throw Object.assign(
      new Error('New password must differ from the current one'),
      { status: 400 },
    );
  }

  const { valid, errors } = validatePassword(newPassword);

  if (!valid) {
    throw Object.assign(
      // eslint-disable-next-line
      new Error('Password does not meet requirements'),
      { status: 400, details: errors },
    );
  }

  const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  User.update(userId, { password: hash });

  return { message: 'Password updated successfully' };
}

// ── Request email change ─────────────────────────────────────────────────────

async function requestEmailChange(userId, { password, newEmail }) {
  if (!password || !newEmail) {
    throw Object.assign(
      // eslint-disable-next-line
      new Error('Password and new email are required'),
      { status: 400 },
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(newEmail)) {
    throw Object.assign(new Error('Invalid email address'), { status: 400 });
  }

  const user = User.findById(userId);

  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw Object.assign(new Error('Password is incorrect'), { status: 401 });
  }

  if (newEmail.toLowerCase() === user.email) {
    throw Object.assign(
      new Error('New email must differ from the current one'),
      { status: 400 },
    );
  }

  if (User.findByEmail(newEmail)) {
    throw Object.assign(
      // eslint-disable-next-line
      new Error('That email address is already in use'),
      { status: 409 },
    );
  }

  // eslint-disable-next-line
  const token = tokenService.createEmailChangeToken(
    userId,
    newEmail.toLowerCase(),
  );

  const result = {
    message: 'A confirmation link has been sent to your new email address.',
  };

  try {
    // eslint-disable-next-line
    await emailService.sendEmailChangeNotification(
      user.email,
      newEmail.toLowerCase(),
    );

    const previewUrl = await emailService.sendEmailChangeConfirmation(
      newEmail.toLowerCase(),
      token,
    );

    if (NODE_ENV !== 'production') {
      result.emailPreview = previewUrl;
    }
  } catch {
    // Don't block on email failure — token is already created
  }

  return result;
}

// ── Confirm email change ─────────────────────────────────────────────────────

function confirmEmailChange(userId, token) {
  const record = tokenService.consumeEmailChangeToken(token);

  if (!record) {
    throw Object.assign(
      new Error('Confirmation link is invalid or has expired'),
      { status: 400 },
    );
  }

  if (record.userId !== userId) {
    throw Object.assign(
      new Error('This link does not belong to your account'),
      { status: 403 },
    );
  }

  const updated = User.update(userId, { email: record.data.newEmail });

  return {
    message: 'Email address updated successfully',
    user: User.toPublic(updated),
  };
}

module.exports = {
  getProfile,
  updateName,
  changePassword,
  requestEmailChange,
  confirmEmailChange,
};
