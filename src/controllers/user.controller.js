const { userService } = require('../services/user.service.js');

async function getAllActive(req, res, next) {
  const users = await userService.getAllActive();

  res.send({ message: users });
}

async function getAllNotActive(req, res, next) {
  const users = await userService.getAllNotActive();

  res.send({ message: users });
}

const userController = {
  getAllActive,
  getAllNotActive,
};

module.exports = { userController };
