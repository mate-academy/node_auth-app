'use strict';

const { EmailToken } = require('../models');
const { createRandomToken, hashToken } = require('./token.service');

async function createEmailToken({ userId, type, expiresAt, newEmail = null }) {
  const token = createRandomToken();

  await EmailToken.create({
    userId,
    type,
    tokenHash: hashToken(token),
    newEmail,
    expiresAt,
  });

  return token;
}

async function consumeEmailToken({ token, type }) {
  const tokenHash = hashToken(token);
  const emailToken = await EmailToken.findOne({
    where: {
      tokenHash,
      type,
    },
  });

  if (!emailToken || emailToken.expiresAt < new Date()) {
    if (emailToken) {
      await emailToken.destroy();
    }

    return null;
  }

  await emailToken.destroy();

  return emailToken;
}

module.exports = {
  consumeEmailToken,
  createEmailToken,
};
