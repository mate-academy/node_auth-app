const userService = require('../services/user.service');

const getAllActive = async (req, res) => {
  const users = await userService.getAllActive();

  res.send(users.map(userService.normalize));
};

module.exports = {
  getAllActive,
};
