'use strict';

const { client } = require('../utils/db.js');
const { DataTypes } = require('sequelize');

const User = client.define('user', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  resetToken: {
    type: DataTypes.STRING,
  },
  newEmail: {
    type: DataTypes.STRING,
    unique: true,
  },
});

module.exports = {
  User,
};
