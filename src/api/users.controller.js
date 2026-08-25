'use strict';

const { userService } = require('../services/user.service.js');
const { usersRepository } = require('../entity/users.repository.js');

const getAll = async (req, res) => {
  const users = await usersRepository.getAllActive();

  res.send(users.map(userService.normalize));
};

module.exports = { usersController: { getAll } };
