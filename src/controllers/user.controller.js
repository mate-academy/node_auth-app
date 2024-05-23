const userServices = require('../services/user.service.js');
const { ApiError } = require('../exeptions/api.error.js');
const validate = require('../utils/validation.js');
const bcrypt = require('bcrypt');

const getAllActivated = async (req, res) => {
  const users = await userServices.getAllActivated();

  res.send(users.map(userServices.normalize));
};

const updateName = async (req, res) => {
  const { name } = req.body;
  const { id } = req.user;

  if (!name) {
    throw ApiError.BadRequest('Validation failed');
  }

  const user = await userServices.findById(id);

  if (!user) {
    throw ApiError.NotFound('User not found');
  }

  if (user.name === name) {
    throw ApiError.BadRequest('Name already exists');
  }

  await userServices.updateName(name, id);

  res.status(204).send({ message: 'Name updated' });
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const { id } = req.user;

  if (!oldPassword || !newPassword || newPassword !== confirmPassword) {
    throw ApiError.BadRequest('Validation failed');
  }

  const errors = {
    password: validate.password(newPassword),
  };

  if (errors.password) {
    throw ApiError.BadRequest('Validation failed', errors);
  }

  const user = await userServices.findById(id);

  if (!user) {
    throw ApiError.NotFound('User not found');
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Wrong password');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await userServices.resetPassword(hashedPassword, id);

  res.status(204).send({ message: 'Password updated' });
};

const changeEmail = async (req, res) => {
  const { password, newEmail } = req.body;
  const { id } = req.user;

  const user = await userServices.findById(id);

  if (!user) {
    throw ApiError.NotFound('User not found');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Wrong password');
  }

  await userServices.changeEmail(newEmail, user);

  res.status(204).send({ message: 'Email updated' });
};

module.exports = {
  getAllActivated,
  updateName,
  changePassword,
  changeEmail,
};
