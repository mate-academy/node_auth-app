import { DataTypes } from 'sequelize';
import { sequelize } from '../utils/db.js';

// eslint-disable-next-line no-unused-vars
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
