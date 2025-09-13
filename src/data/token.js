import { User } from '../data/user.js';
import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';

export const Token = client.define('tokens', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Token.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Token);
