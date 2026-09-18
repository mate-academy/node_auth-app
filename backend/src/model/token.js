const { DataTypes, UUIDV4 } = require('sequelize');
const { client } = require('../utils/db');
const { User } = require('./user');

const Token = client.define('token', {
  id: {
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: UUIDV4,
    allowNull: false,
  },
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Token.belongsTo(User);
User.hasOne(Token);

module.exports = { Token };
