import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';
import { User } from './User.js';

export const Token = client.define('token', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

Token.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasOne(Token, { foreignKey: 'userId' });
