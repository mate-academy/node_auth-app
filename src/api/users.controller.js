'use strict';

const { usersRepository } = require('../entity/users.repository.js');
const { userService } = require('../services/user.service.js');

const getAll = async (req, res) => {
  const users = await usersRepository.getAllActive();

  res.json(users.map(userService.normalize));
};

const usersController = { getAll };

module.exports = { usersController };
