import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const User = sequelize.define('User', {
  name: DataTypes.STRING,
  email: {
    type: DataTypes.STRING,
    unique: true,
  },
  password: DataTypes.STRING,
  activationToken: DataTypes.STRING,
  resetToken: DataTypes.STRING,
  isActivated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});
