'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User.model');
const { validatePassword } = require('../utils/password.utils');
const tokenService = require('./token.service');
const emailService = require('./email.service');
const { JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV } = require('../config/env');

const SALT_ROUNDS = 12;

function signJwt(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// ── Register ─────────────────────────────────────────────────────────────────

async function register({ name, email, password }) {
  if (!name || !name.trim()) {
    throw Object.assign(new Error('Name is required'), { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email)) {
    throw Object.assign(new Error('Valid email is required'), { status: 400 });
  }

  const { valid, errors } = validatePassword(password || '');

  if (!valid) {
    throw Object.assign(
      // eslint-disable-next-line
      new Error('Password does not meet requirements'),
      { status: 400, details: errors },
    );
  }

  if (User.findByEmail(email)) {
    throw Object.assign(
      new Error('An account with this email already exists'),
      { status: 409 },
    );
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = User.create({ name: name.trim(), email, password: hash });
  const token = tokenService.createActivationToken(user.id);

  // eslint-disable-next-line
  const result = {
    message: 'Account created. Please check your email to activate it.',
  };

  try {
    const previewUrl = await emailService.sendActivationEmail(
      user.email,
      user.name,
      token,
    );

    if (NODE_ENV !== 'production') {
      result.emailPreview = previewUrl;
    }
  } catch {
    // Don't block registration if email fails
  }

  return result;
}

// ── Activate ─────────────────────────────────────────────────────────────────

function activate(token) {
  const record = tokenService.consumeActivationToken(token);

  if (!record) {
    throw Object.assign(
      new Error('Activation link is invalid or has expired'),
      { status: 400 },
    );
  }

  const user = User.findById(record.userId);

  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  if (user.isActive) {
    // eslint-disable-next-line
    throw Object.assign(new Error('Account is already active'), {
      status: 400,
    });
  }

  const updated = User.update(user.id, { isActive: true });

  return {
    token: signJwt(updated.id),
    user: User.toPublic(updated),
  };
}

// ── Login ────────────────────────────────────────────────────────────────────

async function login({ email, password }) {
  if (!email || !password) {
    throw Object.assign(
      // eslint-disable-next-line
      new Error('Email and password are required'),
      { status: 400 },
    );
  }

  const user = User.findByEmail(email);

  if (!user) {
    // eslint-disable-next-line
    throw Object.assign(new Error('Invalid email or password'), {
      status: 401,
    });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    // eslint-disable-next-line
    throw Object.assign(new Error('Invalid email or password'), {
      status: 401,
    });
  }

  if (!user.isActive) {
    throw Object.assign(
      new Error(
        // eslint-disable-next-line
        'Account not activated. Please check your email and click the activation link.',
      ),
      { status: 403 },
    );
  }

  return {
    token: signJwt(user.id),
    user: User.toPublic(user),
  };
}

// ── Forgot password ──────────────────────────────────────────────────────────

async function forgotPassword({ email }) {
  if (!email) {
    throw Object.assign(new Error('Email is required'), { status: 400 });
  }

  // Always resolve with success to prevent email enumeration
  const user = User.findByEmail(email);

  if (user) {
    const token = tokenService.createPasswordResetToken(user.id);

    try {
      await emailService.sendPasswordResetEmail(user.email, token);
    } catch {
      // silent
    }
  }

  return {
    message: 'If an account exists for that email, a reset link has been sent.',
  };
}

// ── Validate reset token ─────────────────────────────────────────────────────

function validateResetToken(token) {
  const valid = tokenService.isPasswordResetTokenValid(token);

  if (!valid) {
    throw Object.assign(
      // eslint-disable-next-line
      new Error('Reset link is invalid or has expired'),
      { status: 400 },
    );
  }

  return { valid: true };
}

// ── Reset password ───────────────────────────────────────────────────────────

async function resetPassword(token, { password, confirmation }) {
  if (!password || !confirmation) {
    throw Object.assign(
      // eslint-disable-next-line
      new Error('Password and confirmation are required'),
      { status: 400 },
    );
  }

  if (password !== confirmation) {
    throw Object.assign(new Error('Passwords do not match'), { status: 400 });
  }

  const { valid, errors } = validatePassword(password);

  if (!valid) {
    throw Object.assign(
      // eslint-disable-next-line
      new Error('Password does not meet requirements'),
      { status: 400, details: errors },
    );
  }

  const record = tokenService.consumePasswordResetToken(token);

  if (!record) {
    throw Object.assign(
      // eslint-disable-next-line
      new Error('Reset link is invalid or has expired'),
      { status: 400 },
    );
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS);

  User.update(record.userId, { password: hash });

  return { message: 'Password reset successfully. You can now sign in.' };
}

// ── Logout ───────────────────────────────────────────────────────────────────

/**
 * JWTs are stateless — the token lives on the client and expiry is enforced
 * by the `expiresIn` claim.  Logout simply instructs the client to discard it.
 * If token blocklisting is needed in future, it can be added here without
 * changing the controller or router.
 */
function logout() {
  return { message: 'Logged out successfully' };
}

module.exports = {
  register,
  activate,
  login,
  forgotPassword,
  validateResetToken,
  resetPassword,
  logout,
};
