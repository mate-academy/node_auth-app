import { sequelize } from '../utils/db.js';
import { DataTypes } from 'sequelize';

export const User = sequelize.define('users', {
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  activationToken: {
    type: DataTypes.STRING,
  },
});
