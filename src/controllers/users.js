'use strict';

const { ApiError } = require('../exceptions/ApiError');

const usersService = require('../services/users');

const getAll = async(req, res) => {
  res.send(await usersService.getAll());
};

const getById = async(req, res) => {
  const user = await usersService.getById(req.params.userId);

  if (!user) {
    throw ApiError.NotFound();
  }

  res.send(user);
};

const patch = async(req, res) => {
  const { userId } = req.params;

  const patchedUser = await usersService.patchById(userId, {
    ...req.body,
    id: userId,
  });

  if (!patchedUser) {
    throw ApiError.NotFound();
  }

  res.send(patchedUser);
};

const remove = async(req, res) => {
  const { userId } = req.params;

  const removed = await usersService.removeById(userId);

  if (!removed) {
    throw ApiError.NotFound();
  }

  res.statusCode = 204;
  res.end();
};

module.exports = {
  getAll,
  getById,
  patch,
  remove,
};
