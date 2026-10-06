'use strict';

const nodeCrypto = require('node:crypto');
const { Token } = require('../models/Token.model');

const TOKEN_LIFETIMES = {
  activation: 24 * 60 * 60 * 1000,
  passwordReset: 60 * 60 * 1000,
  emailChange: 60 * 60 * 1000,
};

function hashToken(token) {
  return nodeCrypto.createHash('sha256').update(token).digest('hex');
}

async function createToken(userId, type, newEmail = null) {
  if (!Object.prototype.hasOwnProperty.call(TOKEN_LIFETIMES, type)) {
    throw new Error('Nieprawidłowy typ tokenu');
  }

  const token = nodeCrypto.randomBytes(32).toString('hex');

  await Token.create({
    userId,
    type,
    newEmail,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + TOKEN_LIFETIMES[type]),
  });

  return token;
}

module.exports = {
  hashToken,
  createToken,
};
