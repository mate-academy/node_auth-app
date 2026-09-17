'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

const Token = sequelize.define('Token', {
  userId: {
    type: DataTypes.INTEGER,
    unique: true,
    allowNull: false,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = { Token };
