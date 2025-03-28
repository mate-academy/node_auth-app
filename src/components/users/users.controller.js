'use strict';

const UsersService = require('./users.service');

const getAll = async (req, res) => {
  const users = await UsersService.getAll();

  res.statusCode = 200;
  res.send(users);
};

const getOne = async (req, res) => {
  const { id } = req.params;

  const user = await UsersService.getOne(id);

  res.statusCode = 200;
  res.send(user);
};

module.exports = {
  getAll,
  getOne,
};
