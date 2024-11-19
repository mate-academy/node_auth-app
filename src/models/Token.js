const { DataTypes } = require('sequelize');
const { client } = require('../db.js');
const { User } = require('./User.js');

const Token = client.define('token', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Token.belongsTo(User);
User.hasOne(Token);

module.exports = { Token };
