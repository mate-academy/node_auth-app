'use strict';

const bcrypt = require('bcrypt');

const getHash = async(value) => {
  return bcrypt.hash(value, 10);
};

module.exports = {
  getHash,
};
