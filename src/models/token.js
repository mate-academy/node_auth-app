'use strict';

const { DataTypes } = require('sequelize');

const { sequelize } = require('../utils/db.js');
const { User } = require('./user.js');

const Token = sequelize.define('token', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

User.hasOne(Token, {
  onUpdate: 'RESTRICT',
});

Token.belongsTo(User, {
  foreignKey: {
    unique: true,
  },
  onUpdate: 'RESTRICT',
});

exports.Token = Token;
