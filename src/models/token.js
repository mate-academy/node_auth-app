const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db.js');
const User = require('./user.js');

const Token = sequelize.define('Token', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Token.belongsTo(User);
User.hasOne(Token);

module.exports = Token;
