'use strict';

import { sequelize } from '../utils/db.js';
import { DataTypes } from 'sequelize';
import { User } from './User.js';

export const GithubData = sequelize.define('githubData', {
  login: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
  },
});

GithubData.belongsTo(User);
User.hasOne(GithubData);
