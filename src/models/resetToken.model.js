const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { User } = require('./user.model.js');

const ResetToken = client.define('reset_tokens', {
  resetToken: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

ResetToken.belongsTo(User);
User.hasOne(ResetToken);

module.exports = { ResetToken };
