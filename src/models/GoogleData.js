'use strict';

import { sequelize } from '../utils/db.js';
import { DataTypes } from 'sequelize';
import { User } from './User.js';

export const GoogleData = sequelize.define('googleData', {
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  verifiedEmail: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    default: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  givenName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  familyName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

GoogleData.belongsTo(User);
User.hasOne(GoogleData);
