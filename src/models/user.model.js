import { client } from '../utils/db.js';
import { DataTypes } from 'sequelize';

export const User = client.define('user', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  activationdToken: {
    type: DataTypes.STRING,
  },
});
