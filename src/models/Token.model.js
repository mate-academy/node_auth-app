import { client } from '../db.js';
import { DataTypes } from 'sequelize';
import { User } from './User.model.js';

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
