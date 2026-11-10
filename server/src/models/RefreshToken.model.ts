'use strict';

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const RefreshToken = sequelize.define(
  'RefreshToken',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING,
    },
  },
  {
    updatedAt: false,
  },
);
