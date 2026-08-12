import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';

export const User = client.define('User', {
  name: {
    type: DataTypes.STRING,
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
  isActivated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  activationToken: {
    type: DataTypes.STRING,
  },
  resetToken: {
    type: DataTypes.STRING,
  },
  newEmailToken: {
    type: DataTypes.STRING,
  },
});
