const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
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
  isactive: {
    type: DataTypes.BOOLEAN,
  },
  activation_token: {
    type: DataTypes.TEXT,
  },
});

User.beforeCreate(async (hashUser) => {
  return bcrypt.hash(hashUser.password, 10).then((hash) => {
    hashUser.password = hash;
  });
});

module.exports = User;
