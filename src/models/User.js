const { DataTypes } = require('sequelize');
const { dbClient } = require('../utils/db');

const User = dbClient.define('user', {
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
    allowNull: false,
  },
  activationToken: {
    type: DataTypes.STRING,
  },
});

module.exports = {
  User,
};
