'use strict';

const { ApiError } = require('../exceptions/ApiError');
const expenseService = require('../services/expense.service');
const {
  validateExpensePatchRequestBody,
  validateExpensePostRequestBody,
} = require('../utils/validation');

const getAll = async(req, res) => {
  const userId = req.session.userId || req.user.id;
  const expenses = await expenseService.getByUser({ userId });

  res.send(expenses.map(expense => expenseService.normalize(expense)));
};

const addOne = async(req, res) => {
  const { spentAt, title, amount, category, note } = req.body;

  const isRequestValid = validateExpensePostRequestBody({
    spentAt, title, amount, category, note,
  });

  if (!isRequestValid) {
    throw ApiError.BadRequest('Invalid request');
  }

  const userId = req.session.userId || req.user.id;
  const newExpense = await expenseService.add({
    userId, spentAt, title, amount, category, note,
  });

  res.status(201).send(expenseService.normalize(newExpense));
};

const deleteOne = async(req, res) => {
  const { id } = req.params;

  if (!id) {
    throw ApiError.BadRequest('Invalid request parameters');
  }

  await expenseService.remove(id);
  res.sendStatus(204);
};

const updateOne = async(req, res) => {
  const { id } = req.params;

  if (!id) {
    throw ApiError.BadRequest('Invalid request parameters');
  }

  const { spentAt, title, amount, category, note } = req.body;

  const isRequestValid = validateExpensePatchRequestBody({
    spentAt, title, amount, category, note,
  });

  if (!isRequestValid) {
    throw ApiError.BadRequest('Invalid request');
  }

  const dataToUpdate = {
    spentAt, title, amount, category, note,
  };

  await expenseService.update(id, dataToUpdate);

  const updatedExpense = await expenseService.getById(id);

  res.send(expenseService.normalize(updatedExpense));
};

module.exports = {
  getAll,
  addOne,
  deleteOne,
  updateOne,
};
