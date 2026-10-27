const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');

const User = client.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
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

module.exports = {
  User,
};
