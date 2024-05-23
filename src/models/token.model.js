const { client } = require('../utils/db.js');
const { DataTypes } = require('sequelize');
const { User } = require('./user.model.js');

const Token = client.define('token', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  resetPasswordToken: {
    type: DataTypes.STRING,
  },
});

Token.belongsTo(User);
User.hasOne(Token);

module.exports = { Token };
