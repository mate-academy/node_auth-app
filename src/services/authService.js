'use strict';

const config = require('../config');
const { User } = require('../models');
const cryptoUtils = require('../utils/crypto');
const tokenService = require('./tokenService');
const mailService = require('./mailService');

// Keeps login timing similar when the email does not exist.
const dummyHashPromise = cryptoUtils.hashPassword('dummy-password');

async function sendActivationTo(user) {
  const raw = await tokenService.create(
    user.id,
    'activate',
    config.tokenTtl.activation,
  );

  mailService.sendActivation(user, raw);
}

async function register(data) {
  const existing = await User.findOne({ where: { email: data.email } });

  if (!existing) {
    const user = await User.create({
      name: data.name,
      email: data.email,
      passwordHash: await cryptoUtils.hashPassword(data.password),
    });

    await sendActivationTo(user);
  } else if (!existing.active) {
    await sendActivationTo(existing); // resend; keep the stored password
  } else {
    // Same response for the visitor (no account enumeration).
    mailService.sendAlreadyRegistered(existing);
  }
}

async function resendActivation(email) {
  const user = await User.findOne({ where: { email } });

  if (user && !user.active) {
    await sendActivationTo(user);
  }
}

async function activate(rawToken) {
  const token = await tokenService.find(rawToken, 'activate');
  const user = token ? await User.findByPk(token.userId) : null;

  if (!user) {
    return null;
  }

  user.active = true;
  await user.save();
  await tokenService.removeAll(user.id, 'activate');

  return user;
}

// Returns { status: 'ok' | 'invalid' | 'inactive', user }.
async function authenticate(email, password) {
  const user = await User.findOne({ where: { email } });
  const hashToCheck = user ? user.passwordHash : await dummyHashPromise;
  const valid = await cryptoUtils.verifyPassword(password, hashToCheck);

  if (!user || !valid) {
    return { status: 'invalid', user: null };
  }

  if (!user.active) {
    return { status: 'inactive', user: null };
  }

  return { status: 'ok', user };
}

async function requestPasswordReset(email) {
  const user = await User.findOne({ where: { email } });

  if (user && user.active) {
    const raw = await tokenService.create(
      user.id,
      'reset',
      config.tokenTtl.reset,
    );

    mailService.sendPasswordReset(user, raw);
  } else if (user) {
    await sendActivationTo(user); // confirm the email first
  }
}

async function isResetTokenValid(rawToken) {
  const token = await tokenService.find(rawToken, 'reset');

  return Boolean(token);
}

async function resetPassword(rawToken, password) {
  const token = await tokenService.find(rawToken, 'reset');
  const user = token ? await User.findByPk(token.userId) : null;

  if (!user) {
    return false;
  }

  user.passwordHash = await cryptoUtils.hashPassword(password);
  user.tokenVersion += 1; // logs out every existing session
  await user.save();
  await tokenService.removeAll(user.id, 'reset');
  mailService.sendPasswordChanged(user);

  return true;
}

async function findSessionUser(userId, tokenVersion) {
  const user = await User.findByPk(userId);

  if (user && user.active && user.tokenVersion === tokenVersion) {
    return user;
  }

  return null;
}

module.exports = {
  register,
  resendActivation,
  activate,
  authenticate,
  requestPasswordReset,
  isResetTokenValid,
  resetPassword,
  findSessionUser,
};
