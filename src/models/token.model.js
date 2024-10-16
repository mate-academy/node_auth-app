import { DataTypes } from 'sequelize';
import { sequelize } from '../utils/db.js';
import { User } from './user.model.js';

export const Token = sequelize.define('token', {
  refreshToken: {
    type: DataTypes.UUID,
    allowNull: false,
  },
});

Token.belongsTo(User);
User.hasOne(Token);
