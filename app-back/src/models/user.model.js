import { client } from '../utils/db.utils.js';
import { DataTypes } from 'sequelize';

export const User = client.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  activationToken: {
    type: DataTypes.UUID,
  },
  resetToken: {
    type: DataTypes.UUID,
  }
});
