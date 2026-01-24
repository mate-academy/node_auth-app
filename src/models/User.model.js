'use strict';

const { sequelize } = require('../db.js');
const { DataTypes } = require('sequelize');

const User = sequelize.define(
  'User',
  {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    activationToken: {
      type: DataTypes.STRING,
      field: 'activation_token',
    },
    resetToken: {
      type: DataTypes.STRING,
      field: 'reset_token',
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    underscored: true,
  },
);

module.exports = {
  User,
};
