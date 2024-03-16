'use strict';

const { ApiError } = require('../exceptions/ApiError');
const { Expense } = require('../models/Expense');
const userService = require('../services/user.service');
const categoryService = require('../services/category.service');

const normalize = ({ id, spentAt, title, amount, category, note }) => {
  return {
    id, spentAt, title, amount, category, note,
  };
};

const getByUser = async({ userId }) => {
  if (!(await userService.getById(userId))) {
    throw ApiError.NotFound('User not found');
  }

  return Expense.findAll({ where: { userId } });
};

const removeByUser = async(userId) => {
  await Expense.destroy({ where: { userId } });
};

const getById = async(id) => {
  return Expense.findByPk(id);
};

const add = async({ userId, spentAt, title, amount, category, note }) => {
  if (!(await userService.getById(userId))) {
    throw ApiError.NotFound('User not found');
  }

  const isCategory = await categoryService.getByName(category, userId);

  if (!isCategory) {
    await categoryService.add(category, userId);
  }

  return Expense.create({
    userId, spentAt, title, amount, category, note,
  });
};

const remove = async(id) => {
  if (!(await getById(id))) {
    throw ApiError.NotFound('Expense not found');
  }

  await Expense.destroy({
    where: { id },
  });
};

const removeAllByCategory = async({ category, userId }) => {
  await Expense.destroy({
    where: {
      category, userId,
    },
  });
};

const updateAllByCategory = async({ oldCategory, newCategory, userId }) => {
  await Expense.update({ category: newCategory }, {
    where: {
      category: oldCategory, userId,
    },
  });
};

const update = async(id, dataToUpdate) => {
  const expense = await getById(id);

  if (!expense) {
    throw ApiError.NotFound('Expense not found');
  }

  const data = { ...dataToUpdate };

  Object.keys(data)
    .forEach(key => typeof data[key] === 'undefined' && delete data[key]);

  if (data.category) {
    const isCategory = await categoryService
      .getByName(data.category, expense.userId);

    if (!isCategory) {
      await categoryService.add(data.category, expense.userId);
    }
  }

  await Expense.update(data, { where: { id } });
};

module.exports = {
  normalize,
  getByUser,
  removeByUser,
  getById,
  add,
  remove,
  removeAllByCategory,
  updateAllByCategory,
  update,
};
