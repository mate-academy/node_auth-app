const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils');

const User = sequelize.define('user', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  activationToken: {
    type: DataTypes.STRING,
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
  },
  pendingEmail: {
    type: DataTypes.STRING,
  },
  emailChangeToken: {
    type: DataTypes.STRING,
  },
});

module.exports = User;
