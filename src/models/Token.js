'use strict';

const { DataTypes } = require('sequelize');
const { client } = require('../utils/db');
const { User } = require('./User');

const Token = client.define('token', {
  activationToken: {
    type: DataTypes.STRING,
  },

  refreshToken: {
    type: DataTypes.STRING,
  },

  resetToken: {
    type: DataTypes.STRING,
  },

  newEmailToken: {
    type: DataTypes.STRING,
  },
});

Token.belongsTo(User);
User.hasOne(Token);

module.exports = { Token };
