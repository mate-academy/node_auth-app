'use strict';

import { User } from './User.js';
import { sequelize } from '../utils/db.js';
import { DataTypes } from 'sequelize';

export const Token = sequelize.define('token', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Token.belongsTo(User);
User.hasOne(Token);
