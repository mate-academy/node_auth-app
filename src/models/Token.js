const { DataTypes } = require('sequelize');
const { dbClient } = require('../utils/db');
const { User } = require('./User');

const Token = dbClient.define('token', {
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
