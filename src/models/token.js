import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';
import { User } from './user.js';

export const TOKEN_TYPES = {
  ACTIVATION: 'activationToken',
  RESET_PASSWORD: 'resetPassToken',
  REFRESH: 'refreshToken',
};

export const Token = client.define('token', {
  token: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM(Object.values(TOKEN_TYPES)),
    allowNull: false,
  },
  expireAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  used: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

Token.belongsTo(User);
User.hasMany(Token);
