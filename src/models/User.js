import { sequelize } from '../db.js';
import { DataTypes } from 'sequelize';

export const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
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
    passwordHash: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'password_hash',
    },
    isActivated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_activated',
    },
  },
  {
    underscored: true,
    tableName: 'users',
    timestamps: false,
  },
);
