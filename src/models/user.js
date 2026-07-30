import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';

export const user = client.define('user', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
