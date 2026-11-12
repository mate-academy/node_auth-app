'use strict';

const jsonwebtoken = require('jsonwebtoken');

function generateAccessToken(user) {
  return jsonwebtoken.sign(user, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '10m',
  });
}

function generateRefreshToken(user) {
  return jsonwebtoken.sign(user, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
}

function validateAccessToken(token) {
  try {
    return jsonwebtoken.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    return null;
  }
}

function validateRefreshToken(token) {
  try {
    return jsonwebtoken.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  validateAccessToken,
  validateRefreshToken,
};
