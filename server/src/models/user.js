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
  },
  activationToken: {
    type: DataTypes.STRING,
  },
  activationTokenExpiresAt: {
    type: DataTypes.DATE,
  },
  pendingEmail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  emailToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  emailTokenExpiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  resetToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetTokenExpiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});
