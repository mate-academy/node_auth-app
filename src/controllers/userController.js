'use strict';

const userService = require('../services/userService');

const getAll = async(req, res, next) => {
  const users = await userService.getAllActive();

  res.send(
    users.map(userService.normalize)
  );
};

module.exports = {
  getAll,
};
