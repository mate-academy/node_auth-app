'use strict';

const { DataTypes } = require('sequelize');

const { client } = require('../utils/db');

const User = client.define('user', {
  username: {
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
    allowNull: true,
  },
  newEmail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  confirmationToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resettingPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = { User };
