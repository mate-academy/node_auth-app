const userService = require("../services/user.services");

const getAllActivated = async (req, res) => {
  const users = await userService.getAllActivated();
  res.send(users.map((user) => userService.normalize(user)));
  // #swagger.responses[200] = { description: 'Success' }
};

module.exports = { getAllActivated };
