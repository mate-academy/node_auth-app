'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

// Token types: 'activation', 'password-reset', 'email-change'
const Token = sequelize.define('Token', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // For email-change tokens: stores the new email
  data: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

Token.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(Token, { foreignKey: 'userId' });

module.exports = Token;
