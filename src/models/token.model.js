const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db.js');
const { User } = require('./user.model.js');

const Token = sequelize.define('token', {
  refresh_token: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

User.hasOne(Token);
Token.belongsTo(User);

module.exports = {
  Token,
};
