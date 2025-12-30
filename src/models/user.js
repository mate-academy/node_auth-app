const { DataTypes } = require('sequelize');
const { client } = require('../db.js');

const User = client.define('user', {
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
  resetToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = { User };
