import { DataTypes } from 'sequelize';
import { client } from '../utills/db.js';
import { User } from './userModel.js';

export const Token = client.define('token', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Token.belongsTo(User, { foreignKey: 'UserId' });
User.hasOne(Token, { foreignKey: 'UserId' });
