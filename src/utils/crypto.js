'use strict';

const nodeCrypto = require('crypto');
const { promisify } = require('util');

const scrypt = promisify(nodeCrypto.scrypt);

const randomToken = (bytes = 32) =>
  nodeCrypto.randomBytes(bytes).toString('hex');

const sha256 = (value) =>
  nodeCrypto.createHash('sha256').update(value).digest('hex');

async function hashPassword(password) {
  const salt = nodeCrypto.randomBytes(16);
  const derived = await scrypt(password, salt, 64);

  return `${salt.toString('hex')}:${derived.toString('hex')}`;
}

async function verifyPassword(password, stored) {
  const parts = stored.split(':');
  const expected = Buffer.from(parts[1], 'hex');
  const actual = await scrypt(password, Buffer.from(parts[0], 'hex'), 64);

  return nodeCrypto.timingSafeEqual(expected, actual);
}

module.exports = {
  randomToken,
  sha256,
  hashPassword,
  verifyPassword,
};
