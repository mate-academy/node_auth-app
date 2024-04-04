const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db.js');
const { User } = require('./user.model.js');

const ResetToken = sequelize.define('reset_token', {
  reset_token: {
    type: DataTypes.TEXT,
    unique: true,
    allowNull: false,
  },
});

User.hasOne(ResetToken);
ResetToken.belongsTo(User);

module.exports = {
  ResetToken,
};
