'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');
const { User } = require('./User');

const Token = sequelize.define(
  'Token',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('activation', 'reset', 'email_change', 'refresh'),
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: 'tokens',
    timestamps: true,
  },
);

// Налаштування зв'язку (Token належить User)
User.hasMany(Token, { foreignKey: 'userId', onDelete: 'CASCADE' });
Token.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  Token,
};
