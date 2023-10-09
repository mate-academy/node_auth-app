'use strict';

require('dotenv').config();

const jwt = require('jsonwebtoken');

function sign(user) {
  const token = jwt.sign(user, process.env.JWT_KEY, {
    expiresIn: 15 * 1000,
  });

  return token;
};

function verify(token) {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (e) {
    return null;
  }
};

function signRefresh(user) {
  const token = jwt.sign(user, process.env.JWT_REFRESH_KEY, {
    expiresIn: 21 * 24 * 60 * 60 * 1000,
  });

  return token;
};

function verifyRefresh(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_KEY);
  } catch (e) {
    return null;
  }
};

const jwtService = {
  sign,
  verify,
  signRefresh,
  verifyRefresh,
};

module.exports = {
  jwtService,
};
