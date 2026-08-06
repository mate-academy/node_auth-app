import { DataTypes } from 'sequelize';
import { sequelize } from '../../utils/db.js';
import { User } from '../../api/users/User.model.js';

export const Token = sequelize.define('Token', {
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

Token.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Token, { foreignKey: 'userId' });
