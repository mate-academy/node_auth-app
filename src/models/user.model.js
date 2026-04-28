import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const User = sequelize.define(
  'User',
  {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: false },
    activationToken: { type: DataTypes.STRING },
    resetToken: { type: DataTypes.STRING },

    pendingEmail: { type: DataTypes.STRING },
  },
  { timestamps: true },
);

export default User;
