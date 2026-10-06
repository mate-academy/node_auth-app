'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const { User } = require('./User.model');

const Token = sequelize.define(
  'Token',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    tokenHash: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.ENUM('activation', 'passwordReset', 'emailChange'),
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    newEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
  },
  {
    tableName: 'tokens',
    timestamps: true,
  },
);

module.exports = { Token };
