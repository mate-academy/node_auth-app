'use strict';

const bcrypt = require('bcrypt');

const verifyHash = async(value, hash) => {
  return bcrypt.compare(value, hash);
};

module.exports = {
  verifyHash,
};
