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

const ResetToken = dbClient.define('resetToken', {
  resetToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  expirationTime: {
    type: DataTypes.DATE,
  },
});

ResetToken.belongsTo(User);
User.hasOne(ResetToken);

module.exports = {
  Token,
  ResetToken,
};
