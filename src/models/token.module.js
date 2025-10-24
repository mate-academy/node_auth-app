import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';
import { User } from './user.module.js';

export const Token = client.define(
  'token',
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'tokens',
  },
);

Token.belongsTo(User);
User.hasOne(Token);
