'use strict';

const { Op } = require('sequelize');
const { Token } = require('../models');
const cryptoUtils = require('../utils/crypto');

async function create(userId, type, ttl) {
  const raw = cryptoUtils.randomToken(32);

  await Token.destroy({ where: { expiresAt: { [Op.lt]: new Date() } } });
  await Token.destroy({ where: { userId, type } });

  await Token.create({
    userId,
    type,
    tokenHash: cryptoUtils.sha256(raw),
    expiresAt: new Date(Date.now() + ttl),
  });

  return raw;
}

async function find(raw, type) {
  if (!/^[a-f0-9]{64}$/.test(String(raw))) {
    return null;
  }

  const token = await Token.findOne({
    where: {
      type,
      tokenHash: cryptoUtils.sha256(raw),
    },
  });

  if (!token || token.expiresAt < new Date()) {
    return null;
  }

  return token;
}

async function removeAll(userId, type) {
  const where = type ? { userId, type } : { userId };

  await Token.destroy({ where });
}

module.exports = {
  create,
  find,
  removeAll,
};
