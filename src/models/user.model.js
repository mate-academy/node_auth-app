import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';

export const User = client.define('user', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  activationToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
});
