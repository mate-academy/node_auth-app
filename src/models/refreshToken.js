import { DataTypes } from 'sequelize';
import { client } from '../helpers/database.js';
import { User } from './user.js';

export const Token = client.define('token', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Token.belongsTo(User);
User.hasOne(Token);
