import { v4 as uuidv4 } from 'uuid';
import { sequelize } from '../config/db.js';
import { DataTypes } from 'sequelize';

export const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: uuidv4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  activationToken: {
    type: DataTypes.STRING,
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
  },
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  pendingEmail: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
  },

  emailChangeToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  emailChangeExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  tokenVersion: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});
