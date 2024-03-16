'use strict';

const express = require('express');
const expenseController = require('../controllers/expense.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { catchError } = require('../middlewares/catchError');

const expenseRouter = express.Router();

expenseRouter.get('/', authMiddleware,
  catchError(expenseController.getAll));

expenseRouter.post('/', authMiddleware,
  catchError(expenseController.addOne));

expenseRouter.delete('/:id', authMiddleware,
  catchError(expenseController.deleteOne));

expenseRouter.patch('/:id', authMiddleware,
  catchError(expenseController.updateOne));

module.exports = expenseRouter;
