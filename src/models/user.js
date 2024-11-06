const DataTypes = require('sequelize');
const client = require('../utils/db.js');

const User = client.define('user', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  activationToken: {
    type: DataTypes.STRING,
  },
  pwdResetToken: {
    type: DataTypes.STRING,
  },
});

module.exports = User;
