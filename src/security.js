'use strict';

const {
  randomBytes,
  createHash,
  scrypt,
  timingSafeEqual,
} = require('node:crypto');

const { promisify } = require('node:util');

const deriveKey = promisify(scrypt);

const randomToken = () => randomBytes(32).toString('hex');

const digest = (value) => createHash('sha256').update(value).digest('hex');

const text = (value) => (typeof value === 'string' ? value : '');

const emailAddress = (value) => text(value).trim().toLowerCase();

const validEmail = (value) =>
  value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const validName = (value) => value.length > 0 && value.length <= 100;

const passwordRule = 'Use between 6 and 128 characters.';

function validPassword(value) {
  const length = Array.from(text(value)).length;

  return length >= 6 && length <= 128;
}

async function hashPassword(password, salt = randomToken()) {
  const key = await deriveKey(password, salt, 64);

  return salt + ':' + key.toString('hex');
}

const dummyHash = randomToken() + ':' + randomBytes(64).toString('hex');

async function matchesPassword(password, stored = dummyHash) {
  if (!password || Array.from(password).length > 128) {
    return false;
  }

  const actual = await hashPassword(password, stored.split(':')[0]);

  const actualBuffer = Buffer.from(actual);
  const storedBuffer = Buffer.from(stored);

  if (actualBuffer.length !== storedBuffer.length) {
    return false;
  }

  return timingSafeEqual(actualBuffer, storedBuffer);
}

module.exports = {
  randomToken,
  digest,
  text,
  emailAddress,
  validEmail,
  validName,
  passwordRule,
  validPassword,
  hashPassword,
  matchesPassword,
};
