'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Token = sequelize.define(
  'Token',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    newEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'tokens',
  },
);

module.exports = {
  Token,
};
