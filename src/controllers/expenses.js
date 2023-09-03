'use strict';

const expensesService = require('../services/expenses');

const getAll = async(req, res) => {
  res.send(await expensesService.getAll());
};

const getById = async(req, res) => {
  const expense = await expensesService.getById(req.params.expenseId);

  if (!expense) {
    res.statusCode = 404;
    res.end();

    return;
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
    res.statusCode = 400;
    res.end();

    return;
  }

  const newExpense = await expensesService.create(req.body);

  if (!newExpense) {
    res.statusCode = 422;
    res.end();

    return;
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
    res.statusCode = 404;
    res.end();

    return;
  }

  res.send(patchedExpense);
};

const remove = async(req, res) => {
  const { expenseId } = req.params;

  const removed = await expensesService.removeById(expenseId);

  if (!removed) {
    res.statusCode = 404;
    res.end();

    return;
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
