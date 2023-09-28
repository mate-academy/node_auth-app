'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

require('dotenv').config();

const Expense = sequelize.define('Expense', {
  user: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.NUMBER,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  note: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'mqzbroob',
});

Expense.sync();

module.exports = {
  Expense,
};
