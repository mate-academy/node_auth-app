'use strict';

const { sequelize, DataTypes } = require('../utils/db.js');
const { User } = require('./User.js');

const Token = sequelize.define(
  'token',
  {
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'tokens',
  }
);

Token.belongsTo(User);
User.hasOne(Token);

module.exports = { Token };
