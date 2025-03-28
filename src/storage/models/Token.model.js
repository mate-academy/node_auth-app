'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const { User } = require('./User.model');

const Token = sequelize.define('token', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'tokens',
});

Token.belongsTo(User);
User.hasOne(Token);

Token.sync();

module.exports = {
  Token,
};
