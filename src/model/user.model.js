'use strict';

const { sequelize } = require('../utils/db');
const { DataTypes } = require('sequelize');

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
  },
  activationToken: {
    type: DataTypes.STRING,
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
  },
  googleId: {
    type: DataTypes.STRING,
  },
  githubId: {
    type: DataTypes.STRING,
  },
  facebookId: {
    type: DataTypes.STRING,
  },
});

module.exports = { User };
