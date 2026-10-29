'use strict';

const { sequelize } = require('../utils/db');
const { DataTypes } = require('sequelize');
const { User } = require('./user-model');

const Token = sequelize.define('token', {
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

User.hasMany(Token, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Token.belongsTo(User, {
  foreignKey: 'userId',
});

module.exports = { Token };
