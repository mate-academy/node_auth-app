'use strict';

const jsonwebtoken = require('jsonwebtoken');

const ACCESS_TOKEN_LIFETIME = '15m';
const REFRESH_TOKEN_LIFETIME = '30d';

function generateAccessToken(user) {
  return jsonwebtoken.sign(user, process.env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_LIFETIME,
  });
}

function generateRefreshToken(user) {
  return jsonwebtoken.sign(user, process.env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_LIFETIME,
  });
}

function validate(token, secret) {
  try {
    return jsonwebtoken.verify(token, secret);
  } catch (error) {
    return null;
  }
}

function validateAccessToken(token) {
  return validate(token, process.env.JWT_ACCESS_SECRET);
}

function validateRefreshToken(token) {
  return validate(token, process.env.JWT_REFRESH_SECRET);
}

module.exports = {
  jwt: {
    generateAccessToken,
    generateRefreshToken,
    validateAccessToken,
    validateRefreshToken,
  },
};
