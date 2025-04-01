const { DataTypes } = require('sequelize');
const { client } = require('../config/db');
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
