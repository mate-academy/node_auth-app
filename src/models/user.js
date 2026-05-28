import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';

export const User = client.define('user', {
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
    unique: true,
  },
  activationToken: {
    type: DataTypes.STRING,
  },
  resetToken: {
    type: DataTypes.STRING,
  },
  resetTokenExpiry: {
    type: DataTypes.DATE,
  },
  pendingEmail: {
    type: DataTypes.STRING,
  },
  emailChangeToken: {
    type: DataTypes.STRING,
  },
  emailChangeTokenExpiry: {
    type: DataTypes.DATE,
  },
});
