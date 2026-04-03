'use strict';

const jwt = require('jsonwebtoken');

function generateAccessToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    process.env.JWT_ACCESS_SECRET || 'access_secret',
    { expiresIn: '15m' },
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    process.env.JWT_REFRESH_SECRET || 'refresh_secret',
    { expiresIn: '7d' },
  );
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
