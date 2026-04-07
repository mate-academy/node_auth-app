const DataTypes = require('sequelize');
const client = require('../utils/db.js');
const User = require('./user.js');

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

module.exports = { Token };
