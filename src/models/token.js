import { DataTypes } from 'sequelize';

import { client } from '../utils/db.js';
import { User } from './user.js';

export const Token = client.define('token', {
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
  },
});

Token.belongsTo(User);
User.hasOne(Token);
