const { DataTypes } = require('sequelize');
const { client } = require('../db');
const { User } = require('./User.model');

const Token = client.define('Token', {
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
