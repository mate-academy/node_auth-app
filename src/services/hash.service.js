const bcrypt = require('bcrypt');

const saltRounds = 10;

const hashPassword = (password) => {
  return bcrypt.hash(password, saltRounds);
};

const verifyPassword = (password, hash) => {
  return bcrypt.compare(password, hash);
};

module.exports = {
  hashPassword,
  verifyPassword,
};
