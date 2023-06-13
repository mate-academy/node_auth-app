'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

const User = sequelize.define('user', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '',
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
  },
  restoreCode: {
    type: DataTypes.STRING,
  },
  withGoogle: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = { User };
