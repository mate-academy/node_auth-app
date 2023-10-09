'use strict';

const { client } = require('../utils/db');
const { DataTypes } = require('sequelize');

const User = client.define('user', {
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
  },
}, {
  tableName: 'users',
});

module.exports = {
  User,
};
