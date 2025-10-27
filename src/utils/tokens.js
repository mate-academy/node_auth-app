'use strict';

// eslint-disable-next-line no-shadow
const crypto = require('crypto');

const { db } = require('../models/db');

function issueActivation(email) {
  const token = crypto.randomBytes(24).toString('hex');
  const exp = Date.now() + 1000 * 60 * 30;

  db.activationTokens.set(token, { email: email.toLowerCase(), exp });

  return token;
}

function issueReset(email) {
  const token = crypto.randomBytes(24).toString('hex');
  const exp = Date.now() + 1000 * 60 * 30;

  db.resetTokens.set(token, { email: email.toLowerCase(), exp });

  return token;
}

module.exports = { issueActivation, issueReset };
