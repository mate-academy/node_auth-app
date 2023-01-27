'use strict';

import { sequelize } from '../utils/db.js';
import { DataTypes } from 'sequelize';

export const User = sequelize.define('user', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  activationToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isGoogleConnected: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    default: false,
  },
  isGithubConnected: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    default: false,
  },
  isFacebookConnected: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    default: false,
  },
});
