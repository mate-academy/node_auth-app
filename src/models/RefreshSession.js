'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const { User } = require('./User');

const RefreshSession = sequelize.define(
  'RefreshSession',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    refreshTokenHash: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'refresh_token_hash',
    },

    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at',
    },
  },
  {
    tableName: 'refresh_sessions',
    underscored: true,
  },
);

User.hasMany(RefreshSession, {
  foreignKey: { name: 'userId', field: 'user_id' },
});

RefreshSession.belongsTo(User, {
  foreignKey: { name: 'userId', field: 'user_id' },
});

module.exports = { RefreshSession };
