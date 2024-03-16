'use strict';

const { ApiError } = require('../exceptions/ApiError');
const categoryService = require('../services/category.service');
const expenseService = require('../services/expense.service');

const getAllByUser = async(req, res) => {
  const userId = req.session.userId || req.user.id;
  const categories = await categoryService.getAllByUser(userId);

  res.send(categories.map(category => categoryService.normalize(category)));
};

const addOne = async(req, res) => {
  const { name } = req.body;

  if (typeof name !== 'string') {
    throw ApiError.BadRequest('Invalid request');
  }

  const userId = req.session.userId || req.user.id;
  const newCategory = await categoryService.add(name, userId);

  res.status(201).send(categoryService.normalize(newCategory));
};

const updateOne = async(req, res) => {
  const id = parseInt(req.params.id);
  const { name } = req.body;

  if (isNaN(id) || typeof name !== 'string') {
    throw ApiError.BadRequest('Invalid request');
  }

  const category = await categoryService.getById(id);

  if (!category) {
    throw ApiError.NotFound('Category not found');
  }

  await categoryService.update(id, name);

  await expenseService.updateAllByCategory({
    oldCategory: category.name,
    newCategory: name,
    userId: category.userId,
  });

  const newCategory = await categoryService.getById(id);

  res.send(categoryService.normalize(newCategory));
};

const deleteOne = async(req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    throw ApiError.BadRequest('Invalid request');
  }

  const category = await categoryService.getById(id);

  if (!category) {
    throw ApiError.NotFound('Category not found');
  }

  await expenseService.removeAllByCategory({
    category: category.name,
    userId: category.userId,
  });

  await categoryService.remove(id);

  res.sendStatus(204);
};

module.exports = {
  getAllByUser,
  addOne,
  updateOne,
  deleteOne,
};
