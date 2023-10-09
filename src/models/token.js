'use strict';

const { client } = require('../utils/db');
const { DataTypes } = require('sequelize');
const { User } = require('./user');

const Token = client.define('token', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Token.belongsTo(User);
User.hasOne(Token);

module.exports = {
  Token,
};
