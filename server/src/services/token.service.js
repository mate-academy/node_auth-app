'use strict';

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { env } = require('../config/env');
const { AuthToken } = require('../models');
const { daysFromNow } = require('../utils/time');

function signAccessToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    env.jwt.accessSecret,
    {
      expiresIn: env.jwt.accessExpiresIn,
    },
  );
}

function signRefreshToken(user) {
  return jwt.sign({ userId: user.id }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  });
}

async function createAuthTokens(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await AuthToken.create({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: daysFromNow(30),
  });

  return {
    accessToken,
    refreshToken,
  };
}

async function rotateRefreshToken(oldRefreshToken, user) {
  await AuthToken.destroy({
    where: {
      tokenHash: hashToken(oldRefreshToken),
    },
  });

  return createAuthTokens(user);
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function createRandomToken() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = {
  createRandomToken,
  createAuthTokens,
  hashToken,
  rotateRefreshToken,
  signAccessToken,
  signRefreshToken,
};
