'use strict';

const { userService } = require('../services/user.service');

const getAllUsers = async(req, res) => {
  const users = await userService.getUsers();

  res.status(200).send(users);
};

const userController = { getAllUsers };

module.exports = { userController };
