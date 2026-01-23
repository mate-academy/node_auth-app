'use strict';

// eslint-disable-next-line no-shadow
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function createRandomToken() {
  return crypto.randomBytes(32).toString('hex');
}

function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  });
}

function verifyJwt(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function computeRefreshExpiryDate() {
  const days = 7;
  const ms = days * 24 * 60 * 60 * 1000;

  return new Date(Date.now() + ms);
}

module.exports = {
  sha256,
  createRandomToken,
  signAccessToken,
  signRefreshToken,
  verifyJwt,
  computeRefreshExpiryDate,
};
