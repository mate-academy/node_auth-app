'use strict';

const { DataTypes } = require('sequelize');
const { db } = require('../utils/db.js');
const { User } = require('./User.js');

const Token = db.define('tokens', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  createdAt: false,
});

Token.belongsTo(User);
User.hasOne(Token);

module.exports = { Token };
