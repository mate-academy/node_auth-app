'use strict';

const { DataTypes } = require('sequelize');

const { DatabaseTableNames, sequelize } = require('../libs/db/database.js');
const { User } = require('./user.model.js');

const Expense = sequelize.define(DatabaseTableNames.EXPENSE, {
  spentAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  category: {
    type: DataTypes.STRING,
  },
  note: {
    type: DataTypes.STRING,
  },
}, {
  timestamps: false,
});

Expense.belongsTo(User, { onDelete: 'CASCADE' });
User.hasOne(Expense);

module.exports = {
  Expense,
};
