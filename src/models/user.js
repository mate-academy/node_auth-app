import { DataTypes } from 'sequelize';
import { sequelize } from '../utils/db.js';

export const User = sequelize.define('user', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  activationToken: {
    type: DataTypes.STRING,
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
  },
  pendingEmail: {
    type: DataTypes.STRING,
  },
  emailChangeToken: {
    type: DataTypes.STRING,
  },
});
