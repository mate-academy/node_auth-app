import { DataTypes } from 'sequelize';

import { client } from '../utils/db.js';

export const RefreshToken = client.define('refreshToken', {
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});
