import { DataTypes } from 'sequelize';
import { sequelize } from '../utils/db.js';
import { User } from './user.js';

export const Token = sequelize.define(
  'Token',
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { tableName: 'tokens' },
);

Token.belongsTo(User);
User.hasOne(Token);
