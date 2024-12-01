const { DataTypes } = require('sequelize');
const { client } = require('../utils/db');
const { User } = require('./user');

const Token = client.define('token', {
  refreshToken: { type: DataTypes.STRING, allowNull: true },
});

Token.belongsTo(User);
User.hasOne(Token);

module.exports = {
  Token,
};
