/* eslint-disable */
const { DataTypes } = require('sequelize');
const { client } = require('../utils/db');

const User = client.define(
  'User',
  {
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
    resetPasswordToken: { 
      type: DataTypes.STRING,
    },
    resetPasswordExpires: {  
      type: DataTypes.DATE,
    },
  },
  {
    tableName: 'auth_users',
  },
);

module.exports = {
  User,
};
