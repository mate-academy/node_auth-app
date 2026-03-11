const { ApiError } = require('../exeptions/api.error');
const { User } = require('../models/user.model');
const { userService } = require('../services/user.service');
const bcrypt = require('bcrypt');

const getAllActivated = async (req, res) => {
  const users = await userService.getAllActivated();

  res.send(users.map(userService.normalize));
};

const requestChangePassword = async (req, res) => {
  const { email } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No user with this email');
  }

  await userService.resetPassword(email);

  res.send({ message: 'OK' });
};

const resetPassword = async (req, res) => {
  const { newPassword, confirmation, resetToken } = req.body;

  if (!newPassword || !confirmation) {
    throw ApiError.badRequest('Please provide new password and confirmation');
  }

  if (newPassword !== confirmation) {
    throw ApiError.badRequest('Passwords do not match');
  }

  const user = await User.findOne({ where: { resetToken } });

  if (!user) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  const hashedPass = await bcrypt.hash(newPassword, 10);

  await user.update({ password: hashedPass, resetToken: null });

  res.redirect(`${process.env.CLIENT_HOST}/login`);
};

const changeName = async (req, res) => {
  const { email, newName } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('Incorrect user');
  }

  if (!newName) {
    throw ApiError.badRequest('No new name entered');
  }

  if (user.name === newName) {
    throw ApiError.badRequest('New name is same as current');
  }

  await user.update({ name: newName });

  res.redirect(`${process.env.CLIENT_HOST}/profile`);
};

const changeEmail = async (req, res) => {
  const { email, newEmail } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('Incorrect user');
  }

  if (!newEmail) {
    throw ApiError.badRequest('No email entered');
  }

  if (email === newEmail) {
    throw ApiError.badRequest('New email is same as current');
  }

  await user.update({ email: newEmail });

  res.redirect(`${process.env.CLIENT_HOST}/profile`);
};

const userController = {
  getAllActivated,
  changeEmail,
  changeName,
  requestChangePassword,
  resetPassword,
};

module.exports = { userController };
