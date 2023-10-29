'use strict';

const { ApiError } = require('../exceptions/errors');
const userService = require('../services/user.service');
const emailService = require('../services/email.service');
const { validateName,
  validatePassword,
  validateEmail } = require('../utils/validators');
const bcrypt = require('bcrypt');

const getUser = async(req, res) => {
  const { id } = req.params;
  const user = await userService.getUserById(id);

  res.send(user);
};

const updateName = async(req, res) => {
  const { name } = req.body;
  const { id } = req.params;

  const user = await userService.getUserById(id);

  const isValidName = validateName(name);

  if (!isValidName || name === user.name) {
    throw ApiError.badRequest('Invalid name');
  };

  await userService.updateName(id, name);

  res.send({ message: 'Name updated' });
};

const updatePassword = async(req, res) => {
  const { password, newPassword, confirmation } = req.body;
  const { id } = req.params;

  const user = await userService.getUserById(id);

  const isValidPass = validatePassword(newPassword);

  if (!isValidPass || newPassword !== confirmation) {
    throw ApiError.badRequest('Not valid password');
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    throw ApiError.badRequest('Incorrect old password');
  }

  await userService.updatePassword(user.id, newPassword);

  res.send({ message: 'Password updated' });
};

const updateEmail = async(req, res) => {
  const { password, newEmail, confirmation } = req.body;
  const { id } = req.params;

  const user = await userService.getUserById(id);

  const isValidMail = validateEmail(newEmail);

  if (!isValidMail || newEmail !== confirmation) {
    throw ApiError.badRequest('Email is invalid');
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    throw ApiError.badRequest('Password is invalid');
  }

  await userService.updateEmail(user.id, newEmail);

  await emailService.sendChangedEmail({ email: newEmail });

  res.send({ message: 'Email updated' });
};

module.exports = {
  getUser,
  updateName,
  updatePassword,
  updateEmail,
};
