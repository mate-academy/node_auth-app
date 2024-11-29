const { DataTypes } = require('sequelize');
const { client } = require('../../setup.js');

const User = client.define('users', {
  name: {
    type: DataTypes.STRING,
    allowNull: true,
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
