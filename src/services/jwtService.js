'use strict';

const jwt = require('jsonwebtoken');

function generateAccessToken(user) {
  return jwt.sign(
    user,
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_LIFE },
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    user,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_LIFE }
  );
}

function validateAccessToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    return null;
  }
}

function validateRefreshToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
}

module.exports = {
  jwtService: {
    generateAccessToken,
    generateRefreshToken,
    validateAccessToken,
    validateRefreshToken,
  },
};
