'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../utils/db');

const User = sequelize.define('user', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
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
  timestamps: true,
  tableName: 'users',
});

module.exports = { User };
