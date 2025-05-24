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
    unique: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: false,
  },
  activationToken: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
});
