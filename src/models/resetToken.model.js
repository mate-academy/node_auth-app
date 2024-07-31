import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';
import { User } from './user.model.js';

export const ResetToken = client.define('reset_tokens', {
  resetToken: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

ResetToken.belongsTo(User);
User.hasOne(ResetToken);
