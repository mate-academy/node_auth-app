import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';
import { User } from './user.js';

export const ResetToken = client.define('reset_token', {
  resetToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

ResetToken.belongsTo(User);
User.hasOne(ResetToken);
