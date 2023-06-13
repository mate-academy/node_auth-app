'use strict';

const expensesService = require('../services/expensesService');
const userService = require('../services/userService');

const getByFilter = async(req, res) => {
  const query = req.query;
  const expenses = await expensesService.getFilteredExpenses(query);

  res.send(expenses);
};

const getById = async(req, res) => {
  const { id } = req.params;
  const foundExpenses = await expensesService.getAllByUserId(id);

  if (!foundExpenses) {
    res.sendStatus(404);

    return;
  }

  res.send(foundExpenses);
};

const create = async(req, res) => {
  const {
    userId,
    title,
    amount,
    category,
    note,
  } = req.body;

  const foundUser = await userService.getById(userId);

  const isAllDataProvided = (
    foundUser
    && userId
    && title
    && amount
    && category
  );

  if (!isAllDataProvided) {
    res.sendStatus(400);

    return;
  }

  const newExpense = await expensesService.create(
    userId,
    Date.now(),
    title,
    amount,
    category,
    note
  );

  res.statusCode = 201;
  res.send(newExpense);
};

const update = async(req, res) => {
  const { id: userId } = req.params;
  const newData = req.body;

  const foundExpense = await expensesService.getById(userId);

  if (!foundExpense) {
    res.sendStatus(404);

    return;
  }

  await expensesService.update({
    userId,
    newData,
  });

  const updatedExpene = await expensesService.getById(userId);

  res.send(updatedExpene);
};

const remove = async(req, res) => {
  const { id } = req.params;
  const foundExpense = expensesService.getById(id);

  if (!foundExpense) {
    res.sendStatus(404);

    return;
  }

  try {
    await expensesService.remove(id);
    res.sendStatus(204);
  } catch (error) {
    res.sendStatus(402);
  }
};

module.exports = {
  getByFilter,
  getById,
  create,
  update,
  remove,
};
