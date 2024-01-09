'use strict';

const jwt = require('jsonwebtoken');

function sign(user) {
  return jwt.sign(user, process.env.JWT_KEY);
}

function verify(token) {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (e) {
    return null;
  }
}

function signRefresh(user) {
  return jwt.sign(user, process.env.JWT_REFRESH_KEY);
}

function verifyRefresh(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_KEY);
  } catch (e) {
    return null;
  }
}

module.exports = {
  sign, verify, signRefresh, verifyRefresh,
};
