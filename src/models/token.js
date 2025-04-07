import { DataTypes } from 'sequelize';
import { db } from '../utils/db.js';
import { User } from './user.js';

export const Token = db.define('token', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

Token.belongsTo(User);
User.hasOne(Token);
