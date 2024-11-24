const { DataTypes } = require('sequelize');
const { sequilize } = require('../utils/db');
const { User } = require('./user.model');

const Token = sequilize.define(
  'token',
  {
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    createdAt: false,
    updatedAt: false,
  },
);

Token.belongsTo(User);
User.hasOne(Token);

module.exports = { Token };
