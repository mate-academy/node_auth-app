'use strict';

const nodeCrypto = require('node:crypto');
const { promisify } = require('node:util');

const scrypt = promisify(nodeCrypto.scrypt);
const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (value) => value.length >= 8 },
  { label: 'One uppercase letter', test: (value) => /[A-Z]/.test(value) },
  { label: 'One lowercase letter', test: (value) => /[a-z]/.test(value) },
  { label: 'One number', test: (value) => /\d/.test(value) },
  {
    label: 'One special character',
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
];

const normalizeEmail = (value = '') => value.trim().toLowerCase();

const validatePassword = (password = '') =>
  PASSWORD_RULES.filter((rule) => !rule.test(password)).map(
    (rule) => rule.label,
  );

const hashPassword = async (password) => {
  const salt = nodeCrypto.randomBytes(16);
  const derivedKey = await scrypt(password, salt, 64);

  return `scrypt$${salt.toString('hex')}$${derivedKey.toString('hex')}`;
};

const verifyPassword = async (password, encoded) => {
  const [algorithm, saltHex, keyHex] = String(encoded).split('$');

  if (algorithm !== 'scrypt' || !saltHex || !keyHex) {
    return false;
  }

  const expected = Buffer.from(keyHex, 'hex');
  const actual = await scrypt(password, Buffer.from(saltHex, 'hex'), 64);

  return (
    expected.length === actual.length &&
    nodeCrypto.timingSafeEqual(expected, actual)
  );
};

const newToken = () => nodeCrypto.randomBytes(32).toString('base64url');
const tokenDigest = (token) =>
  nodeCrypto.createHash('sha256').update(token).digest('hex');

const sign = (value, secret) =>
  nodeCrypto.createHmac('sha256', secret).update(value).digest('base64url');

const createSignedValue = (value, secret) => `${value}.${sign(value, secret)}`;

const readSignedValue = (signedValue, secret) => {
  const separator = signedValue.lastIndexOf('.');

  if (separator < 1) {
    return null;
  }

  const value = signedValue.slice(0, separator);
  const received = Buffer.from(signedValue.slice(separator + 1));
  const expected = Buffer.from(sign(value, secret));

  if (
    received.length !== expected.length ||
    !nodeCrypto.timingSafeEqual(received, expected)
  ) {
    return null;
  }

  return value;
};

const safeEqual = (first = '', second = '') => {
  const firstBuffer = Buffer.from(first);
  const secondBuffer = Buffer.from(second);

  return (
    firstBuffer.length === secondBuffer.length &&
    nodeCrypto.timingSafeEqual(firstBuffer, secondBuffer)
  );
};

module.exports = {
  PASSWORD_RULES,
  createSignedValue,
  hashPassword,
  newToken,
  normalizeEmail,
  readSignedValue,
  safeEqual,
  tokenDigest,
  validatePassword,
  verifyPassword,
};
