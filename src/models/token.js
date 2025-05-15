const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { User } = require('./user.js');

const Token = client.define('token', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Token.belongsTo(User);
User.hasOne(Token);

module.exports = { Token };
