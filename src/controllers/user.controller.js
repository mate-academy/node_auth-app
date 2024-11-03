const { userService } = require('../services/user.service.js');

async function getAll(req, res, next) {
  const users = await userService.getAllActive();

  res.send(users.map(userService.normalize));
}

const userController = { getAll };

module.exports = { userController };
