'use strict';

const { expenseRepository } = require('../../repositories/expense/expense.js');
const { ExpenseService } = require('./expense.service.js');

const expenseService = new ExpenseService(expenseRepository);

module.exports = {
  expenseService,
};
