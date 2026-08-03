'use strict';

const { sequelize } = require('../utils/db.js');
const { User } = require('./User.js');
const { Token } = require('./Token.js');

module.exports = {
  sequelize,
  User,
  Token,
};
