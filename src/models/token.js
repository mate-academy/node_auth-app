const { DataTypes } = require('sequelize');
const { User } = require('./user');
const { client } = require('../utils/db.js');

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
