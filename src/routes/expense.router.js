'use strict';

const express = require('express');

const {
  authMiddleware, catchError, rolePermissionMiddleware,
} = require('../libs/middlewares/middlewares.js');

const { ExpenseController } = require('../controllers/expense.controller.js');
const { expenseService } = require('../services/expense/expense.js');
const { userService } = require('../services/user/user.js');
const {
  createValidation, updateValidation, filtersValidation,
} = require('../libs/validation/expense/validation.js');

const expenseRouter = new express.Router();

const expenseController = new ExpenseController(expenseService, userService);

expenseRouter.use(catchError(authMiddleware));
expenseRouter.use(catchError(rolePermissionMiddleware));

expenseRouter.get(
  '/',
  catchError(filtersValidation),
  catchError(expenseController.getExpenses.bind(expenseController))
);

expenseRouter.get(
  '/:id',
  catchError(expenseController.getExpense.bind(expenseController))
);

expenseRouter.post(
  '/',
  catchError(createValidation),
  catchError(expenseController.create.bind(expenseController))
);

expenseRouter.delete(
  '/:id',
  catchError(expenseController.remove.bind(expenseController))
);

expenseRouter.patch(
  '/:id',
  catchError(updateValidation),
  catchError(expenseController.update.bind(expenseController))
);

module.exports = { expenseRouter };
