const { DataTypes } = require('sequelize');
const { client } = require('../utils/db');
const { User } = require('./user');

const Token = client.define(
  'Token',
  {
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

const initTokensTable = async () => {
  await Token.sync({ force: true });
};

module.exports = { Token, initTokensTable };
