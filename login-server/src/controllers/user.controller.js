'use strict';

const { getAllActivated, normalize } = require('../services/user.service');
const getAllUsers = async(req, res) => {
  const users = await getAllActivated();

  res.send(users.map(normalize));
};

module.exports = {
  getAllUsers,
};
