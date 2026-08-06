import * as expensesService from './expense.service.js';
import * as usersService from '../users/users.service.js';
import { ApiError } from '../../exceptions/api.error.js';

export const getAll = async (req, res) => {
  const expenses = await expensesService.getAll(req.query);

  res.json(expenses);
};

export const getOne = async (req, res) => {
  const expense = await expensesService.getOne(req.params.id);

  if (!expense) {
    throw ApiError.notFound('Expense not found');
  }

  res.json(expense);
};

export const create = async (req, res) => {
  if (!expensesService.isValidParams(req.body)) {
    throw ApiError.badRequest('Invalid request');
  }

  const { title, amount, category, userId, note, spentAt } = req.body;

  const user = await usersService.getOne(userId);

  if (!user) {
    throw ApiError.badRequest('User not found');
  }

  const expense = await expensesService.create({
    userId,
    title,
    amount,
    category,
    note,
    spentAt,
  });

  res.status(201).json(expense);
};

export const deleteOne = async (req, res) => {
  const expense = await expensesService.getOne(req.params.id);

  if (!expense) {
    throw ApiError.notFound('Expense not found');
  }

  await expensesService.deleteById(req.params.id);

  res.sendStatus(204);
};

export const update = async (req, res) => {
  const expense = await expensesService.getOne(req.params.id);

  if (!expense) {
    throw ApiError.notFound('Expense not found');
  }

  if (!req.body || !expensesService.isValidParams(req.body, true)) {
    throw ApiError.badRequest('Invalid request');
  }

  if (req.body.userId) {
    const user = await usersService.getOne(req.body.userId);

    if (!user) {
      throw ApiError.badRequest('User not found');
    }
  }

  const updatedExpense = await expensesService.update(req.params.id, req.body);

  res.json(updatedExpense);
};
