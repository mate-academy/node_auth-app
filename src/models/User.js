const { DataTypes } = require('sequelize');
const { client } = require('../db.js');

const User = client.define('users', {
  userName: {
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
    type: DataTypes.UUID,
    allowNull: true,
  },
  resetToken: {
    type: DataTypes.UUID,
    allowNull: true,
  },
});

module.exports = { User };
