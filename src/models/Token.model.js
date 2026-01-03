import { DataTypes } from 'sequelize';
import client from '../util/db.js';
import { User } from './User.model.js';

export const Token = client.define(
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
    underscored: true,
  },
);

Token.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
User.hasOne(Token, { foreignKey: 'user_id' });
