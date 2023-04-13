'use strict';

require('dotenv').config();

const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.JWT_ACCESS_SECRET);
};

const validateAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken, validateAccessToken,
};
