'use strict';

const expensesService = require('./expensesService');

const ApiError = require('./ApiError');

const getAll = async(req, res) => {
  try {
    res.send(await expensesService.getAll());
  } catch (e) {
    if (e instanceof ApiError.NotFound) {
      res.sendStatus(404);
    } else {
      // Log or rethrow the error if it is not handled.
    }
  }
};

const getById = async(req, res) => {
  const expense = await expensesService.getById(req.params.expenseId);

  if (!expense) {
    throw new ApiError.NotFound();
  }

  res.send(expense);
};

const create = async(req, res) => {
  const {
    user = null,
    date = null,
    title = null,
    amount = null,
    category = null,
  } = req.body;

  if (!user || !date || !title || !amount || !category) {
    throw new ApiError.NotFound();
  }

  const newExpense = await expensesService.create(req.body);

  if (!newExpense) {
    throw new ApiError.NotFound();
  }

  res.send(newExpense);
};

const patch = async(req, res) => {
  const { expenseId } = req.params;

  const patchedExpense = await expensesService.patchById(expenseId, {
    ...req.body,
    id: expenseId,
  });

  if (!patchedExpense) {
    throw new ApiError.NotFound();
  }

  res.send(patchedExpense);
};

const remove = async(req, res) => {
  const { expenseId } = req.params;

  const removed = await expensesService.removeById(expenseId);

  if (!removed) {
    throw new ApiError.NotFound();
  }

  res.statusCode = 204;
  res.end();
};

module.exports = {
  getAll,
  getById,
  create,
  patch,
  remove,
};
