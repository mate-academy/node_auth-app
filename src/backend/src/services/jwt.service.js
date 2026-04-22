'use strict';

const jwt = require('jsonwebtoken');

function signToken(payload, secret, expiresIn) {
  return jwt.sign(payload, secret, { expiresIn });
}

function verifyToken(token, secret) {
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}

function sign(payload) {
  return signToken(
    payload,
    process.env.JWT_ACCESS_SECRET,
    process.env.JWT_ACCESS_EXPIRES || '1d',
  );
}

function verify(token) {
  return verifyToken(token, process.env.JWT_ACCESS_SECRET);
}

function signEmailChangeToken(payload) {
  return signToken(
    payload,
    process.env.JWT_EMAIL_CHANGE_SECRET || process.env.JWT_ACCESS_SECRET,
    process.env.JWT_EMAIL_CHANGE_EXPIRES || '1h',
  );
}

function verifyEmailChangeToken(token) {
  return verifyToken(
    token,
    process.env.JWT_EMAIL_CHANGE_SECRET || process.env.JWT_ACCESS_SECRET,
  );
}

function signPasswordResetToken(payload) {
  return signToken(
    payload,
    process.env.JWT_PASSWORD_RESET_SECRET || process.env.JWT_ACCESS_SECRET,
    process.env.JWT_PASSWORD_RESET_EXPIRES || '1h',
  );
}

function verifyPasswordResetToken(token) {
  return verifyToken(
    token,
    process.env.JWT_PASSWORD_RESET_SECRET || process.env.JWT_ACCESS_SECRET,
  );
}

module.exports = {
  sign,
  verify,
  signEmailChangeToken,
  verifyEmailChangeToken,
  signPasswordResetToken,
  verifyPasswordResetToken,
};
