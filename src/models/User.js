import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';

export const User = client.define('users', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  activationToken: {
    type: DataTypes.STRING,
  },
  resetEmailToken: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  pendingEmail: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
});
