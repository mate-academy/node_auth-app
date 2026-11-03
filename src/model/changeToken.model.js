import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const ChangeToken = sequelize.define('ChangeToken', {
  newEmail: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
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
