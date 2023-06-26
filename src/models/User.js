'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db.js');

const User = sequelize.define('user', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  activationToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  restoreCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isActivated: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

module.exports = { User };
