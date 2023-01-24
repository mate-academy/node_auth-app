'use strict';

const { sequelize } = require('../utils/db');
const { DataTypes } = require('sequelize');
const { User } = require('./User');

const Token = sequelize.define('token', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Token.belongsTo(User);
User.hasOne(Token);

module.exports = { Token };
