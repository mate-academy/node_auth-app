// models/User.js
'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'password_hash',
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_active',
    },

    activationToken: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'activation_token',
    },
    activationTokenHash: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'activation_token_hash',
    },
    resetTokenHash: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'reset_token_hash',
    },
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'reset_token',
    },
    resetTokenExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'reset_token_expires_at',
    },
  },
  {
    tableName: 'users',
    underscored: true,
  },
);

module.exports = { User };
