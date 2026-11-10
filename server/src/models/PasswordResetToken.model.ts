'use strict';

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const ResetPasswordToken = sequelize.define(
  'ResetPasswordToken',
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
      allowNull: false,
      unique: true,
    },
    usedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    updatedAt: false,
  },
);
