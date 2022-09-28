'use strict';

const { Router } = require('express');

const expensesController = require('../controllers/expenses');
const { catchError } = require('../middlewares/catchError');

const router = Router();

router
  .get('/', catchError(expensesController.getAll))
  .get('/:expenseId', catchError(expensesController.getById))
  .post('/', catchError(expensesController.create))
  .patch('/:expenseId', catchError(expensesController.patch))
  .delete('/:expenseId', catchError(expensesController.remove));

module.exports = { router };
