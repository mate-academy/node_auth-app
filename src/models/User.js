'use strict';

const { DataTypes } = require('sequelize');
const { db } = require('../utils/db.js');

const User = db.define('users', {
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
  },
  activationToken: {
    type: DataTypes.STRING,
  },
  googleId: {
    type: DataTypes.STRING,
  },
}) || {};

module.exports = { User };
