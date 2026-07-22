'use strict';

const jwt = require('jsonwebtoken');

const { env } = require('../config/env');
const { AuthToken, User } = require('../models');
const { ApiError } = require('../utils/ApiError');
const { hashPassword } = require('./password.service');
const {
  createAuthTokens,
  hashToken,
  rotateRefreshToken,
} = require('./token.service');

async function createUser({ name, email, password }) {
  const existingUser = await User.findOne({
    where: {
      email: email.toLowerCase(),
    },
  });

  if (existingUser) {
    throw ApiError.badRequest('Email is already used');
  }

  return User.create({
    name,
    email: email.toLowerCase(),
    passwordHash: await hashPassword(password),
    isActivated: false,
  });
}

async function loginUser({ email, password }) {
  const user = await User.findOne({
    where: {
      email: email.toLowerCase(),
    },
  });

  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.badRequest('Invalid email or password');
  }

  if (!user.isActivated) {
    throw ApiError.forbidden('Please activate your email before login');
  }

  return {
    user,
    tokens: await createAuthTokens(user),
  };
}

async function refreshUserSession(refreshToken) {
  if (!refreshToken) {
    throw ApiError.unauthorized('Refresh token is required');
  }

  let payload;

  try {
    payload = jwt.verify(refreshToken, env.jwt.refreshSecret);
  } catch (error) {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  const storedToken = await AuthToken.findOne({
    where: {
      tokenHash: hashToken(refreshToken),
    },
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    if (storedToken) {
      await storedToken.destroy();
    }

    throw ApiError.unauthorized('Refresh token is expired');
  }

  const user = await User.findByPk(payload.userId);

  if (!user) {
    throw ApiError.unauthorized('User no longer exists');
  }

  return {
    user,
    tokens: await rotateRefreshToken(refreshToken, user),
  };
}

async function logoutUser(refreshToken) {
  if (!refreshToken) {
    return;
  }

  await AuthToken.destroy({
    where: {
      tokenHash: hashToken(refreshToken),
    },
  });
}

module.exports = {
  createUser,
  loginUser,
  logoutUser,
  refreshUserSession,
};
