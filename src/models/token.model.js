'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db.js');
const { User } = require('./user.model.js');

const Token = sequelize.define('token', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Token.belongsTo(User);
User.hasOne(Token);

module.exports = { Token };
