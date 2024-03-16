'use strict';

const { DataTypes } = require('sequelize');
const { client } = require('../utils/db');
const { User } = require('./User');

const Account = client.define('account', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM(['google', 'github']),
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Account.belongsTo(User);
User.hasMany(Account);

module.exports = { Account };
