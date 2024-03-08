'use strict';

const bcrypt = require('bcrypt');

async function getHash(password) {
  const hash = await bcrypt.hash(password, 10);

  return hash;
}

async function isEquel(password, hashedPassword) {
  const isCompared = await bcrypt.compare(password, hashedPassword);

  return isCompared;
}

module.exports = { bcryptService: {
  getHash, isEquel,
} };
