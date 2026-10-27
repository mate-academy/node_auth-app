'use strict';

const { DataTypes } = require('sequelize');

const { sequelize } = require('./db');

const User = sequelize.define(
  'auth_users',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    // Тут зберігається ХЕШ
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    activationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: 'auth_users',
  },
);

module.exports = {
  User,
};
