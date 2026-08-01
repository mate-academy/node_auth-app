import { client } from '../utils/db.js';
import { DataTypes } from 'sequelize';

export const Token = client.define('Token', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
