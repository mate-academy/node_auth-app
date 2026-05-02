import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export const User = sequelize.define('User', {
  name: DataTypes.STRING,

  email: {
    type: DataTypes.STRING,
    unique: true,
  },

  password: DataTypes.STRING,

  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  activationToken: {
    type: DataTypes.STRING,
    defaultValue: uuidv4,
  },

  resetToken: DataTypes.STRING,
});
