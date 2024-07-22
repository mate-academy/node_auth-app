import { DataTypes } from 'sequelize';
import { sequelize } from '../utils/db.js';
import { User } from './user.model.js';

export const Token = sequelize.define(
  'Token',
  {
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'tokens',
  },
);
