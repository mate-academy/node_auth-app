import { client } from '../utils/db.js';
import { User } from './user.js';
import { DataTypes } from 'sequelize';

export const Token = client.define('token', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Token.belongsTo(User);
User.hasOne(Token);
