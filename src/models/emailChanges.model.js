import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';
import { User } from './user.model.js';

export const EmailChanges = client.define('email_changes', {
  oldEmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  newEmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  confirmNewEmailToken: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

EmailChanges.belongsTo(User);
User.hasOne(EmailChanges);
