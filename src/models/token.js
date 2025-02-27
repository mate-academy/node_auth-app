import { DataTypes } from 'sequelize';
import { sequelize } from '../utils/db.js';
import { User } from './user.js';

export const Token = sequelize.define('Token', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Token.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Token, { foreignKey: 'userId' });
