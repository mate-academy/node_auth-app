import { DataTypes } from 'sequelize';
import { sequelize } from '../utils/db';
import { User } from './User';

export const Token = sequelize.define('token', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Token.belongsTo(User);
User.hasOne(Token);
