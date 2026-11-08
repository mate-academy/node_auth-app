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

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
