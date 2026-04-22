'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const { User } = require('./user.model');

const SocialAccount = sequelize.define(
  'SocialAccount',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    providerUserId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'providerId',
    },
    providerEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'providerEmail',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
    },
  },
  // We use these indexes to ensure uniqueness and improve query performance
  {
    tableName: 'social_accounts',
    indexes: [
      {
        unique: true,
        fields: ['provider', 'providerId'],
      },
      {
        unique: true,
        fields: ['user_id', 'provider'],
      },
    ],
  },
);

User.hasMany(SocialAccount, {
  foreignKey: 'userId',
  as: 'socialAccounts',
});

SocialAccount.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

module.exports = { SocialAccount };
