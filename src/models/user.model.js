import { DataTypes } from 'sequelize';
import { sequelize } from '../utils/db.js';
import { Token } from './token.model.js';

export const User = sequelize.define(
  'User',
  {
    id: {
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    activationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'users',
  },
);

Token.belongsTo(User);
User.hasOne(Token);
