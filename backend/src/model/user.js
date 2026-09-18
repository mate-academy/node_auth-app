const { DataTypes, UUIDV4 } = require('sequelize');
const { client } = require('../utils/db');

const User = client.define('user', {
  id: {
    type: DataTypes.UUID,
    allowNull: false,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  userName: {
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
  },
  resetTokenExpires: {
    type: DataTypes.STRING,
  },
});

module.exports = { User };
