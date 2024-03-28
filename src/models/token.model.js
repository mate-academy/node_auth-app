'use strict';

const { DataTypes } = require('sequelize');

const { DatabaseTableNames, sequelize } = require('../libs/db/database.js');
const { User } = require('./user.model.js');

const Token = sequelize.define(DatabaseTableNames.TOKEN, {
  activationToken: {
    type: DataTypes.STRING,
  },
  refreshToken: {
    type: DataTypes.TEXT,
  },
  resetToken: {
    type: DataTypes.STRING,
  },
  newEmailToken: {
    type: DataTypes.TEXT,
  },
});

Token.belongsTo(User, { onDelete: 'CASCADE' });
User.hasOne(Token);

module.exports = {
  Token,
};
