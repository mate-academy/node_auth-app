'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../utils/db');
const { User } = require('../../users/schema/users.schema');

const Token = sequelize.define('token', {
  refreshToken: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: 'token',
});

Token.belongsTo(User, {
  foreignKey: 'userId',
});

User.hasOne(Token, {
  foreignKey: 'userId',
});

module.exports = { Token };
