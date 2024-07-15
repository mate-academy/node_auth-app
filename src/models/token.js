import { DataTypes } from 'sequelize';
import { User } from './user.js';
import { client } from '../utils/db.js';

export const Token = client.define('token', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Token.belongsTo(User);
User.hasOne(Token);
