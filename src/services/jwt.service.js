const jwt = require('jsonwebtoken');

require('dotenv').config();

function sign(user) {
  return jwt.sign(user, process.env.JWT_KEY, {
    expiresIn: '10s',
  });
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

function signResetPassword(user) {
  return jwt.sign(user, process.env.JWT_RESET_PASSWORD_KEY, {
    expiresIn: '10m',
  });
}

function verifyResetPassword(token) {
  try {
    return jwt.verify(token, process.env.JWT_RESET_PASSWORD_KEY);
  } catch (e) {
    return null;
  }
}

module.exports = {
  sign,
  verify,
  signRefresh,
  verifyRefresh,
  signResetPassword,
  verifyResetPassword,
};
