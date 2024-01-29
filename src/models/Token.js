'use strict';

import { User } from './User';
const DataTypes = require('sequelize');
const { client } = require('../utils/bd');


export const Token = client.define('token', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Token.belongsTo(User);
User.hasOne(Token);
