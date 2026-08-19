'use strict';

const { DataTypes } = require('sequelize');

const sequelize = require('../config/db');

const Session = sequelize.define(
  'Session',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    tokenHash: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: 'sessions',
    indexes: [{ fields: ['userId'] }, { fields: ['expiresAt'] }],
  },
);

module.exports = Session;
