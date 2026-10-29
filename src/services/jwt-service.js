'use strict';

const jwt = require('jsonwebtoken');
const keyJWTAccess = process.env.JWT_ACCESS_SECRET;
const keyJWTRefresh = process.env.JWT_REFRESH_SECRET;

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, keyJWTAccess, { expiresIn: '15m' });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, keyJWTRefresh, { expiresIn: '7d' });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, keyJWTAccess);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, keyJWTRefresh);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
