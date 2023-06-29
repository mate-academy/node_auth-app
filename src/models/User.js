'use strict';

const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../utils/db.js');
const { Token } = require('./Token');

class User extends Model {
  static associate(model) {
    this.hasOne(model, { foreignKey: 'userId' });
  }
}

User.init({
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: {
        args: true,
        msg: 'Must be a valid email address',
      },
    },
  },
  password: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: {
        args: [6, 100],
        msg: 'Password length should be between 8 and 255 characters',
      },
    },
  },
  activationToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  restoreCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isActivated: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  sequelize,
  modelName: 'user',
});

User.associate(Token);

module.exports = { User };
