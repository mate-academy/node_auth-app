'use strict';

const { DataTypes } = require('sequelize');

const { sequelize } = require('../config/db');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(254),
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    activationTokenHash: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    activationTokenExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    resetTokenHash: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    resetTokenExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'users',
    indexes: [
      { fields: ['activationTokenHash'] },
      { fields: ['resetTokenHash'] },
    ],
  },
);

module.exports = User;
