const { sequelize } = require('../utils/db');
const { DataTypes } = require('sequelize');

const User = sequelize.define('user', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
  },
  activation_token: {
    type: DataTypes.TEXT,
  },
  googleId: {
    type: DataTypes.NUMBER,
    allowNull: true,
    unique: true,
  },
  gitHubId: {
    type: DataTypes.NUMBER,
    allowNull: true,
    unique: true,
  },
});

module.exports = {
  User,
};
