import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';
import User from './userModel.js';

export const Token = sequelize.define(
  'Token',
  {
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'tokens',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);

Token.belongsTo(User);
User.hasOne(Token);

export default Token;
