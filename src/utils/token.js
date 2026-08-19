'use strict';

const nodeCrypto = require('crypto');

function createToken() {
  return nodeCrypto.randomBytes(32).toString('hex');
}

function hashToken(token) {
  return nodeCrypto.createHash('sha256').update(String(token)).digest('hex');
}

module.exports = {
  createToken,
  hashToken,
};
