import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';
import { User } from './user.js';

export const Token = client.define('token', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetToken: {
    type: DataTypes.UUID,
  },
  securityToken: {
    type: DataTypes.UUID,
  },
  oldEmail: {
    type: DataTypes.STRING,
  },
  securityExpiresAt: {
    type: DataTypes.DATE,
  },
});

Token.belongsTo(User);
User.hasOne(Token);
