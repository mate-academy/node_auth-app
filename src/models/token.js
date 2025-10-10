import { DataTypes } from 'sequelize';
import { sequelize } from '../utils/db.js';
import { User } from './user.js';

export const Token = sequelize.define(
  'token',
  {
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetTokenExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    emailChangeToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'Tokens',
  },
);

Token.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Token, { foreignKey: 'userId' });
