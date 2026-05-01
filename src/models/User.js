import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    isActivated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    activationLink: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    resetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },

  {
    tableName: 'users',
    timestamps: true,
  },
);
