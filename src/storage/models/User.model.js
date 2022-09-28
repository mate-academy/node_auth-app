'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

require('dotenv').config();

const User = sequelize.define('user', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  hashed_password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  salt: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  activationToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'users',
});

User.sync();

module.exports = {
  User,
};
