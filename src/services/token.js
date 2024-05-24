'use strict';

const jwt = require('jsonwebtoken');
const { ApiError } = require('../exeptions/api.error');

require('dotenv/config');

function getToken(payload, type, options = {}) {
  const tokenKey = getPrivatekey(type);

  return jwt.sign(payload, tokenKey, { ...options });
}

function verifyToken(token, type) {
  try {
    const tokenKey = getPrivatekey(type);

    const data = jwt.verify(token, tokenKey);

    return data;
  } catch (error) {
    return undefined;
  }
}

function getPrivatekey(type) {
  switch (type) {
    case 'activate':
      return process.env.PRIVATE_ACTIVATE_TOKEN_KEY;

    case 'access':
      return process.env.PRIVATE_ACCESS_TOKEN_KEY;

    case 'refresh':
      return process.env.PRIVATE_REFRESH_TOKEN_KEY;

    case 'resetPassword':
      return process.env.PRIVATE_RESET_PASSWORD_TOKEN_KEY;

    default:
      throw ApiError.badRequest({ message: 'Invalid token type' });
  }
}

module.exports = {
  token: {
    getToken,
    verifyToken,
  },
};
