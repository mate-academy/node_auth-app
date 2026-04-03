/* eslint-disable */

const usersService = require('../services/user.service.js');

const getAllActivated = async (req, res) => {
  const users = await usersService.getAllActivated();

  res.send(
    users.map(usersService.normalize)
  );
}


module.exports = {
  getAllActivated,
};
