import { DataTypes } from 'sequelize';
import { sequelize } from '../utils/db.js';

export const User = sequelize.define(
  'User',
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    activationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    passwordChangeToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pendingPassword: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    emailChangeToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pendingEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'users',
  },
);
