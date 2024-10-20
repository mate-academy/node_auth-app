import { DataTypes } from 'sequelize';
import { sequelize } from '../utils/db.js';

export const User = sequelize.define('user', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        args: true,
        msg: 'Invalid e-mail',
      },
    },
  },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  activationToken: {
    type: DataTypes.UUID,
  },
});
