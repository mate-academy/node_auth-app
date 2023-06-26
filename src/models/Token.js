'use strict';

const { sequelize } = require('../utils/db.js');
const { DataTypes } = require('sequelize');
const { User } = require('./User.js');

const Token = sequelize.define('Token', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Token.belongsTo(User);
User.hasOne(Token);

module.exports = { Token };
