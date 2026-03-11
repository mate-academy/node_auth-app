const { DataTypes } = require('sequelize');
const { client } = require('../utils/db');
const { User } = require('./user.model');

const Token = client.define('token', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Token.belongsTo(User);
User.hasOne(Token);

module.exports = { Token };
