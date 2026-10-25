const { DataTypes } = require('sequelize');
const { User } = require('./user.js');
const { client } = require('../utils/db.js');

export const Token = client.define('token', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Token.belongsTo(User);
User.hasOne(Token);

module.exports = { Token };
