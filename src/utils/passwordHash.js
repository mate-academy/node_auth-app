'use strict';

const crypto = require('crypto');
const util = require('util');

const scrypt = util.promisify(crypto.scrypt);
const KEY_LENGTH = 64;

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await scrypt(password, salt, KEY_LENGTH);

  return `scrypt$${salt}$${derivedKey.toString('hex')}`;
}

async function verifyPassword(password, storedHash) {
  const [algorithm, salt, keyHex] = String(storedHash || '').split('$');

  if (algorithm !== 'scrypt' || !salt || !keyHex) {
    return false;
  }

  const storedKey = Buffer.from(keyHex, 'hex');
  const derivedKey = await scrypt(password, salt, storedKey.length);

  if (storedKey.length !== derivedKey.length) {
    return false;
  }

  return crypto.timingSafeEqual(storedKey, derivedKey);
}

module.exports = {
  hashPassword,
  verifyPassword,
};
