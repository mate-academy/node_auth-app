'use strict';

const { client } = require('../utils/db');
const { DataTypes } = require('sequelize');

const User = client.define('users', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  activationToken: {
    type: DataTypes.STRING,
  },
});

module.exports = {
  User,
};
