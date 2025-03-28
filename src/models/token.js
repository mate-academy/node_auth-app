const { DataTypes } = require('sequelize');
const { client } = require('../utils/db');
const { User } = require('./user');

const Token = client.define('token', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Token.belongsTo(User);
User.hasOne(Token);

const initTableTokens = async () => {
  await Token.sync({ force: true });
};

module.exports = {
  Token,
  initTableTokens,
};
