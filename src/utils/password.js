'use strict';

const bcrypt = require('bcrypt');

const PASSWORD_RULES =
  'Hasło musi mieć minimum 12 znaków, małą i wielką literę oraz cyfrę. ' +
  'Maksymalna długość to 72 bajty — ' +
  'polskie znaki mogą zajmować więcej niż jeden bajt.';

function validatePassword(password) {
  if (typeof password !== 'string') {
    return PASSWORD_RULES;
  }

  const isValid =
    password.length >= 12 &&
    Buffer.byteLength(password, 'utf8') <= 72 &&
    /\p{Ll}/u.test(password) &&
    /\p{Lu}/u.test(password) &&
    /[0-9]/.test(password);

  return isValid ? null : PASSWORD_RULES;
}

async function hashPassword(password) {
  const error = validatePassword(password);

  if (error) {
    throw new Error(error);
  }

  return bcrypt.hash(password, 12);
}

async function verifyPassword(password, passwordHash) {
  if (
    typeof password !== 'string' ||
    Buffer.byteLength(password, 'utf8') > 72
  ) {
    return false;
  }

  return bcrypt.compare(password, passwordHash);
}

module.exports = {
  PASSWORD_RULES,
  validatePassword,
  hashPassword,
  verifyPassword,
};
