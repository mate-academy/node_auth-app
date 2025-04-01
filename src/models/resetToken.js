const { DataTypes } = require('sequelize');
const { client } = require('../config/db');
const { User } = require('./user');

const ResetToken = client.define('resetToken', {
  resetToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  expirationTime: {
    type: DataTypes.DATE,
  },
});

ResetToken.belongsTo(User);
User.hasOne(ResetToken);

module.exports = {
  ResetToken,
};
