const userService = require('../services/user.service.js');

const getAllActivated = async (req, res) => {
  const users = await userService.getAllActivated();

  res.send(users.map(userService.normalize));
};

module.exports = {
  getAllActivated,
};
