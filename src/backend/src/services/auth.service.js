'use strict';

const { createHash } = require('crypto');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const jwtService = require('./jwt.service');

const { User } = require('../models/user.model');
const { ApiError } = require('../utils/ApiError');
const {
  validateName,
  validateEmail,
  validatePassword,
} = require('../utils/validate');
const userService = require('./user.service');
const mailService = require('./mail.service');

// Hash the stored bcrypt hash so reset tokens expire after a password change
// without exposing the password hash itself inside the signed token payload.
function getPasswordResetFingerprint(passwordHash) {
  return createHash('sha256')
    .update(passwordHash || 'no-password')
    .digest('hex');
}

async function register({ name, email, password }) {
  const errors = {};

  const nameError = validateName(name);
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);

  if (nameError) {
    errors.name = nameError;
  }

  if (emailError) {
    errors.email = emailError;
  }

  if (passwordError) {
    errors.password = passwordError;
  }

  if (Object.keys(errors).length > 0) {
    throw ApiError.badRequest('Validation failed', errors);
  }

  const existing = await userService.findByEmail(email);

  if (existing) {
    throw ApiError.badRequest('Validation failed', {
      email: 'Email is already taken',
    });
  }

  const activationToken = uuidv4();
  const passwordHash = await bcrypt.hash(password, 10);

  await User.create({
    name: name.trim(),
    email,
    password: passwordHash,
    activationToken,
  });

  await mailService.sendActivationLink(email, activationToken);
}

async function activate(activationToken) {
  const user = await userService.findByActivationToken(activationToken);

  if (!user) {
    throw ApiError.notFound('Invalid activation token');
  }

  user.activationToken = null;
  await user.save();

  return user;
}

async function login({ email, password }) {
  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.password) {
    throw ApiError.unauthorized(
      'This account does not have a password yet. ' +
        'Sign in with GitHub or reset your password to set one.',
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (user.activationToken) {
    throw ApiError.unauthorized(
      'Your account is not activated yet.' +
        ' Check your email for the activation link.',
    );
  }

  return {
    accessToken: jwtService.sign({ id: user.id, email: user.email }),
  };
}

async function requestPasswordReset({ email }) {
  const normalizedEmail = String(email).trim();
  const emailError = validateEmail(normalizedEmail);

  if (emailError) {
    throw ApiError.badRequest('Validation failed', {
      email: emailError,
    });
  }

  const user = await userService.findByEmail(normalizedEmail);

  if (!user) {
    return;
  }

  const token = jwtService.signPasswordResetToken({
    type: 'password-reset',
    userId: user.id,
    fingerprint: getPasswordResetFingerprint(user.password),
  });

  await mailService.sendPasswordResetLink(normalizedEmail, token);
}

async function resetPassword({ token, password }) {
  const errors = {};
  const passwordError = validatePassword(password);

  if (passwordError) {
    errors.password = passwordError;
  }

  if (Object.keys(errors).length > 0) {
    throw ApiError.badRequest('Validation failed', errors);
  }

  const payload = jwtService.verifyPasswordResetToken(token);

  if (!payload || payload.type !== 'password-reset') {
    throw ApiError.notFound('Invalid password reset token');
  }

  const user = await userService.findById(payload.userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (getPasswordResetFingerprint(user.password) !== payload.fingerprint) {
    throw ApiError.badRequest('Password reset link is no longer valid');
  }

  user.password = await bcrypt.hash(password, 10);
  await user.save();
}

module.exports = {
  register,
  activate,
  login,
  requestPasswordReset,
  resetPassword,
};
