const { DataTypes } = require('sequelize');
const { client } = require('../utills/db.js');
const { User } = require('./userModel.js');

const Token = client.define('token', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Token.belongsTo(User, { foreignKey: 'UserId' });
User.hasOne(Token, { foreignKey: 'UserId' });

module.exports = {
  Token,
};
