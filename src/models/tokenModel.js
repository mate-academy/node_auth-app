import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';
import { User } from './userModel.js';

export const Token = sequelize.define('Token', {
  refreshToken: DataTypes.STRING,
});

Token.belongsTo(User);
User.hasMany(Token);
