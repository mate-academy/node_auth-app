const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.js');

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(250),
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  activation_token: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  reset_password_token: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  reset_password_expiry: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

module.exports = { User };
