'use strict';

const { DataTypes } = require('sequelize');
const { client } = require('../utils/db');
const { Category } = require('./Category');
const { User } = require('./User');

const Expense = client.define('expense', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  spentAt: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  note: {
    type: DataTypes.STRING,
  },
});

Expense.belongsTo(User);
User.hasMany(Expense);

Expense.belongsTo(Category, {
  foreignKey: 'category',
  targetKey: 'name',
  as: 'categoryName',
});

Category.hasMany(Expense, {
  sourceKey: 'name',
  foreignKey: 'category',
  as: 'categoryName',
});

module.exports = { Expense };
