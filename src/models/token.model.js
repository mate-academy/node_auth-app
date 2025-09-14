import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';

export const Token = client.define('token', {
  refreshToken: {
    type: DataTypes.STRING(512),
    allowNull: false,
    unique: true,
  },
});
