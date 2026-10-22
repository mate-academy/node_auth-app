const { userService } = require('../services/user.service.js');

const getById = async (req, res) => {
  return userService.getUserById(req, res);
};

const update = async (req, res) => {
  return userService.updateUser(req, res);
};

const updatePassword = async (req, res) => {
  const user = await userService.changePassword(req.user.id, req.body);

  res.status(200).json(user);
};

const updateEmail = async (req, res) => {
  const user = await userService.changeEmail(req.user.id, req.body);

  res.status(200).json(user);
};

const getAll = async (req, res) => {
  const users = await userService.getAllUsers(req, res);

  res.status(200).json(users);
};

const userController = {
  getById,
  update,
  updatePassword,
  updateEmail,
  getAll,
};

module.exports = { userController };
