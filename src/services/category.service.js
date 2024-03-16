'use strict';

const { ApiError } = require('../exceptions/ApiError');
const { Category } = require('../models/Category');
const userService = require('../services/user.service');

const normalize = ({ id, name }) => {
  return {
    id, name,
  };
};

const getByName = (name, userId) => {
  return Category.findOne({
    where: {
      name, userId,
    },
  });
};

const getById = (id) => {
  return Category.findOne({
    where: { id },
  });
};

const getAllByUser = async(userId) => {
  if (!(await userService.getById(userId))) {
    throw ApiError.NotFound('User not found');
  }

  return Category.findAll({
    where: { userId },
  });
};

const removeAllByUser = async(userId) => {
  await Category.destroy({
    where: { userId },
  });
};

const add = async(name, userId) => {
  if (!(await userService.getById(userId))) {
    throw ApiError.NotFound('User not found');
  }

  if (await getByName(name, userId)) {
    throw ApiError.BadRequest('Category already exists');
  }

  return Category.create({
    name, userId,
  });
};

const update = async(id, newName) => {
  if (!(await getById(id))) {
    throw ApiError.NotFound('Category not found');
  }

  return Category.update({ name: newName }, {
    where: { id },
  });
};

const remove = async(id) => {
  await Category.destroy({
    where: { id },
  });
};

module.exports = {
  normalize,
  getAllByUser,
  removeAllByUser,
  getByName,
  getById,
  add,
  update,
  remove,
};
