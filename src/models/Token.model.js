const { DataTypes } = require('sequelize');
const { client } = require('../utils/db');
const { User } = require('./User.model');

const Token = client.define('token', {
  refreshToken: {
    type: DataTypes.STRING,
  },
});

Token.belongsTo(User);
User.hasOne(Token);

module.exports = {
  Token,
};
