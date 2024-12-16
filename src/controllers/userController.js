const userService = require('../services/userService.js');

const getAllActivated = async (req, res) => {
  const users = await userService.getAllActivated();

  res.send(users.map(userService.normalize));
};

module.exports = {
  getAllActivated,
};
