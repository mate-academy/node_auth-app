import { DataTypes } from 'sequelize';
import { client } from '../untils/db.js';
import { User } from './User.js';

export const Token = client.define('token', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Token.belongsTo(User);
User.hasOne(Token);
