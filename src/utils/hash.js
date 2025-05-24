const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const hashData = async (data) => {
  return bcrypt.hash(data, SALT_ROUNDS);
};

const compareData = async (data, hashedData) => {
  return bcrypt.compare(data, hashedData);
};

module.exports = {
  hashData,
  compareData,
};
