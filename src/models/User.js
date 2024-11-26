import { DataTypes } from '@sequelize/core';
import sequelize from './../utils/db.js';

const User = sequelize.define('user', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  newEmail: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  activationToken: {
    type: DataTypes.STRING,
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
  },
  activationNewEmailToken: {
    type: DataTypes.STRING,
  },
});

export default User;
