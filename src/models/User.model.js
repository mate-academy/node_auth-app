'use strict';

const { DataTypes } = require('sequelize');
const { client } = require('../utils/db');

const User = client.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
    activationToken: {
      type: DataTypes.STRING,
    },
    updateToken: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: 'users_auth',
    updatedAt: false,
    createdAt: false,
  },
);

module.exports = {
  User,
};
