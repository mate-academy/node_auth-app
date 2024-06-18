const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/usersDB');
const { User } = require('../user.model/user.postgresql');

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

module.exports = { Token };
