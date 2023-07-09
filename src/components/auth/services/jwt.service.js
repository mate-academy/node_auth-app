'use strict';

const jwt = require('jsonwebtoken');

const config = require('../config/config');

function generateAccessToken(user) {
  return jwt.sign(user, config.jwtAccessSecret, { expiresIn: '5d' });
}

function generateRefreshToken(user) {
  return jwt.sign(user, config.jwtRefreshSecret, { expiresIn: '7d' });
}

function validateAccessToken(token) {
  try {
    return jwt.verify(token, config.jwtAccessSecret);
  } catch (error) {
    return error;
  }
}

function validateRefreshToken(token) {
  try {
    return jwt.verify(token, config.jwtRefreshSecret);
  } catch (error) {
    return error;
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  validateAccessToken,
  validateRefreshToken,
};
