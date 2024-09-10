const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db.js');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allownull: false,
    },
    name: {
      type: DataTypes.STRING,
      allownull: false,
    },
    email: {
      type: DataTypes.STRING,
      allownull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allownull: false,
      validate: {
        len: [6, 10000],
      },
    },
    activationToken: {
      type: DataTypes.STRING,
      unique: true,
    },
  },
  {
    tableName: 'users',
    timestamps: true,
  },
);

module.exports = {
  User,
};
