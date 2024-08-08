const ApiError = require('../exeptions/api.error');
const userService = require('../services/user.service');

const getAllActivated = async (req, res) => {
  const users = await userService.getAllActivated();

  res.send(users.map((user) => userService.normalize(user)));
};

const updateName = async (req, res) => {
  const userId = req.user.id;
  const { name } = req.body;

  if (!name) {
    throw ApiError.BadRequest('Name is required');
  }

  const updatedUser = await userService.updateName(userId, name);

  res.send(updatedUser);
};

const updateEmail = async (req, res) => {
  const userId = req.user.id;
  const { newEmail, password } = req.body;

  if (!newEmail || !password) {
    throw ApiError.BadRequest('Email and password are required');
  }

  const updatedUser = await userService.updateEmail(userId, newEmail, password);

  res.send(updatedUser);
};

const updatePassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword, confirmation } = req.body;

  if (!currentPassword || !newPassword || !confirmation) {
    return res
      .status(400)
      .send({ message: 'All password fields are required' });
  }

  if (newPassword !== confirmation) {
    throw ApiError.BadRequest('Passwords do not match');
  }

  await userService.updatePassword(userId, currentPassword, newPassword);
  res.send({ message: 'Password changed successfully' });
};

module.exports = {
  getAllActivated,
  updateName,
  updateEmail,
  updatePassword,
};
