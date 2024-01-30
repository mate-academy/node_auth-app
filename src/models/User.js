'use strict';
const DataTypes = require('sequelize');
const { client } = require('../utils/bd');


const User = client.define('user', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  activationToken: {
    type: DataTypes.STRING,
  }
}, {
  tableName: 'Users',
});

module.exports = {
  User,
};
