'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');
const { User } = require('./User.model');

const Token = sequelize.define(
  'Token',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'tokens',
  },
);

Token.belongsTo(User);
User.hasOne(Token);

module.exports = {
  Token,
};
