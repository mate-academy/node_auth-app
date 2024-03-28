'use strict';

const { Expense } = require('../../models/expense.model.js');
const { ExpenseRepository } = require('./expense.repository.js');

const expenseRepository = new ExpenseRepository(Expense);

module.exports = {
  expenseRepository,
};
