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
    type: DataTypes.UUIDV4,
    allowNull: true,
  },
  resetToken: {
    type: DataTypes.UUIDV4,
    allowNull: true,
  },
});

module.exports = { User };
