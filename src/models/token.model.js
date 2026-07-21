const { v4: uuidv4 } = require('uuid');

const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');
const User = require('./user.model');

const Token = sequelize.define('Token', {
  id: {
    type: DataTypes.UUIDV4,
    primaryKey: true,
    defaultValue: uuidv4(),
  },
  userId: {
    type: DataTypes.UUIDV4,
    allowNull: false,
    field: 'user_id',
    references: {
      model: User,
      key: 'id',
    },
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'token',
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'tokens',
  timestamps: false,
  underscored: true,
});

module.exports = Token;
