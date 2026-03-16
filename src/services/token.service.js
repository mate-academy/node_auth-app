'use strict';

const Token = require('../models/Token.model');

/**
 * Time-to-live values for each token type (in hours).
 * Centralised here so they're easy to adjust without touching the model.
 */
const TTL = {
  ACTIVATION: 24, // 24 h — plenty of time to check email
  PASSWORD_RESET: 1, //  1 h — short window for security
  EMAIL_CHANGE: 24, // 24 h — new inbox may have a delay
};

// ── Create ───────────────────────────────────────────────────────────────────

function createActivationToken(userId) {
  return Token.create(userId, Token.TOKEN_TYPES.ACTIVATION, TTL.ACTIVATION);
}

function createPasswordResetToken(userId) {
  return Token.create(
    userId,
    Token.TOKEN_TYPES.PASSWORD_RESET,
    TTL.PASSWORD_RESET,
  );
}

/**
 * @param {string} userId
 * @param {string} newEmail - stored in the token payload,
 *  applied on confirmation
 */
function createEmailChangeToken(userId, newEmail) {
  return Token.create(
    userId,
    Token.TOKEN_TYPES.EMAIL_CHANGE,
    TTL.EMAIL_CHANGE,
    { newEmail },
  );
}

// ── Find (peek — does NOT consume) ───────────────────────────────────────────

/**
 * Check whether a password-reset token is still valid without consuming it.
 * Used by the frontend to validate the token before showing the reset form.
 *
 * @param {string} token
 * @returns {boolean}
 */
function isPasswordResetTokenValid(token) {
  return Token.isValid(token, Token.TOKEN_TYPES.PASSWORD_RESET);
}

// ── Consume (validates + deletes in one step) ────────────────────────────────

function consumeActivationToken(token) {
  return Token.consume(token, Token.TOKEN_TYPES.ACTIVATION);
}

function consumePasswordResetToken(token) {
  return Token.consume(token, Token.TOKEN_TYPES.PASSWORD_RESET);
}

/**
 * @returns {{ userId: string, data: { newEmail: string } }|null}
 */
function consumeEmailChangeToken(token) {
  return Token.consume(token, Token.TOKEN_TYPES.EMAIL_CHANGE);
}

module.exports = {
  // create
  createActivationToken,
  createPasswordResetToken,
  createEmailChangeToken,
  // peek
  isPasswordResetTokenValid,
  // consume
  consumeActivationToken,
  consumePasswordResetToken,
  consumeEmailChangeToken,
};
