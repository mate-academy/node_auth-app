'use strict';

const { User } = require('./User');
const DataTypes = require('sequelize');
const { client } = require('../utils/bd');


const Token = client.define('token', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Token.belongsTo(User);
User.hasOne(Token);

module.exports = {
  Token,
}
