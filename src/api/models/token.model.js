const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');
const { User } = require('./users.model');

const Token = sequelize.define(
  'token',
  {
    token: {
      type: DataTypes.STRING,
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'tokens',
  },
);

Token.belongsTo(User);
User.hasOne(Token);

const initTableTokens = () => {
  Token.sync({ force: true });
};

module.exports = {
  Token,
  initTableTokens,
};
