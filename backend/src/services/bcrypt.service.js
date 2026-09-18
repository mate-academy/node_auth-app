const bcrypt = require('bcrypt');

const hashPassword = (password) => bcrypt.hash(password, 10);
const isValidPass = (password, hashPass) => bcrypt.compare(password, hashPass);

const bcryptService = { hashPassword, isValidPass };

module.exports = { bcryptService };
