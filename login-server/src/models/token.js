'use strict';

const { client } = require('../utils/db.js');
const { DataTypes } = require('sequelize');
const { User } = require('../models/user');

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
