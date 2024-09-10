const ApiError = require('../exeptions/api.error.js');
const usersService = require('../services/users.service.js');
const bcrypt = require('bcrypt');

const getAllActivated = async (req, res) => {
  const users = await usersService.getAllActivated();

  res.send(users);
};

const updateUserName = async (req, res) => {
  const userId = req.user.id;
  const { name } = req.body;

  const user = usersService.getOneBy(userId);

  if (!user) {
    throw ApiError.NotFound();
  }

  if (!name) {
    throw ApiError.BadRequest('Name is required');
  }

  const updatedUser = await usersService.updateUserName(userId, name);

  res.send(updatedUser);
};

const updateUserEmail = async (req, res) => {
  const userId = req.user.id;
  const { newEmail, password } = req.body;

  const user = await usersService.getOneBy(userId);
  const isPasswordValid = await bcrypt.compare(password, user.password);
  const existingUser = await usersService.getOneBy(newEmail);

  if (!user) {
    throw ApiError.NotFound();
  }

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Wrong password');
  }

  if (!newEmail || !password) {
    throw ApiError.BadRequest('Email and password are required');
  }

  if (existingUser) {
    throw ApiError.BadRequest('Email already in use');
  }

  const updatedUser = await usersService.updateUserEmail(userId, newEmail);

  res.send(updatedUser);
};

const updateUserPassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword, confirmation } = req.body;

  const user = await usersService.getOneBy(userId);
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!user) {
    throw ApiError.NotFound();
  }

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Current password is incorrect');
  }

  if (!currentPassword || !newPassword || !confirmation) {
    return res
      .status(400)
      .send({ message: 'All password fields are required' });
  }

  if (newPassword !== confirmation) {
    throw ApiError.BadRequest('Passwords do not match');
  }

  await usersService.updateUserPassword(userId, newPassword);
  res.send({ message: 'Password changed successfully' });
};

module.exports = {
  getAllActivated,
  updateUserName,
  updateUserEmail,
  updateUserPassword,
};
