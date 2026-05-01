import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const Token = sequelize.define(
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
      unique: true,
    },

    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { tableName: 'tokens', timestamps: true },
);
