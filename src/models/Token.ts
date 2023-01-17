'use strict';

import { sequelize } from '../utils/db';
import { DataTypes } from 'sequelize';
import { User } from './User';

const Token = sequelize.define('token', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Token.belongsTo(User);
User.hasOne(Token);

module.exports = { Token };
