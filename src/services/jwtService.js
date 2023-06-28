'use strict';

const jwt = require('jsonwebtoken');

const generateAccessToken = user =>
  jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '10m' });
const generateRefreshToken = user =>
  jwt.sign(user, process.env.JWT_REFRESH, { expiresIn: '30d' });
const validateAccessToken = token => {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (e) {
    return null;
  }
};
const validateRefreshToken = token => {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_REFRESH);
  } catch (e) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  validateAccessToken,
  generateRefreshToken,
  validateRefreshToken,
};
