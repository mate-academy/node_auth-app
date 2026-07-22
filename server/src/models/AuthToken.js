'use strict';

const { DataTypes, Model } = require('sequelize');

const { sequelize } = require('../config/database');

class AuthToken extends Model {}

AuthToken.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    tokenHash: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'AuthToken',
    tableName: 'auth_tokens',
  },
);

module.exports = { AuthToken };
