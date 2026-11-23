import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';

export const User = client.define('user', {
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
    allowNull: true,
  },
  resetToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetTokenExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  pendingEmail: {
    type: DataTypes.STRING,
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
});
