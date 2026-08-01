import { client } from '../utils/db.js';
import { DataTypes } from 'sequelize';

export const User = client.define('User', {
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
  resetToken: {
    type: DataTypes.STRING,
  },
  newEmail: {
    type: DataTypes.STRING,
  },
  emailChangeToken: {
    type: DataTypes.STRING,
  },
});
