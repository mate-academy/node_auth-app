import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const ResetToken = sequelize.define('ResetToken', {
  tokenHash: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});
