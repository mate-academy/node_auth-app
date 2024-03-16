'use strict';

const { DataTypes } = require('sequelize');
const { client } = require('../utils/db');
const uuidv4 = require('uuid').v4;

const User = client.define('user', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  authType: {
    type: DataTypes.ENUM(['local', 'google', 'github']),
    defaultValue: 'local',
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      customValidator(value) {
        if (value === null && this.authType === 'local') {
          throw new Error(
            'Password is required if user is authenticated locally');
        }
      },
    },
  },
});

User.beforeValidate((user) => {
  if (!user.id) {
    user.id = uuidv4();
  }
});

module.exports = { User };
