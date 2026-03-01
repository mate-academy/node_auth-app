import { DataTypes } from 'sequelize';
import { User } from './User.model.js';
import { sequelize } from '../utils/db.js';

export const Token = sequelize.define(
  'Token',
  {
    refreshToken: {
      type: DataTypes.STRING,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    tableName: 'tokens',
    timestamps: true,
  },
);

Token.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Token, { foreignKey: 'userId', onDelete: 'CASCADE' });
