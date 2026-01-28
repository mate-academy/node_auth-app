import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Token = sequelize.define(
  'Token',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    type: {
      type: DataTypes.ENUM('ACTIVATION', 'RESET_PASSWORD', 'CHANGE_EMAIL'),
      allowNull: false,
    },

    tokenHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    consumedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    meta: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: 'tokens',
    underscored: true,
  },
);
