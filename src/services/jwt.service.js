'use strict';

const jwt = require('jsonwebtoken');

const generateToken = (user, secret, expiresIn) => {
  return jwt.sign(user, process.env[secret], { expiresIn });
};

const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, process.env[secret]);
  } catch (error) {
    return null;
  }
};

const jwtService = {
  generateToken,
  verifyToken,
};

module.exports = {
  jwtService,
};
