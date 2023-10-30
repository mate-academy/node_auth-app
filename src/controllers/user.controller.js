'use strict';

const { ApiError } = require('../exceptions/errors');
const userService = require('../services/user.service');
const emailService = require('../services/email.service');
const bcrypt = require('bcrypt');
const validator = require('validator');

const getUser = async(req, res) => {
  const { id } = req.params;
  const user = await userService.getUserById(id);

  res.send(user);
};

const updateName = async(req, res) => {
  const { name } = req.body;
  const { id } = req.params;

  const user = await userService.getUserById(id);

  if (!validator.isLength(name, {
    min: 2, max: 20,
  })) {
    throw ApiError.badRequest('Invalid name');
  }

  if (name === user.name) {
    throw ApiError.badRequest('Name is the same as the current name');
  }

  await userService.updateName(id, name);

  res.send({ message: 'Name updated' });
};

const updatePassword = async(req, res) => {
  const { password, newPassword, confirmation } = req.body;
  const { id } = req.params;

  const user = await userService.getUserById(id);

  const isValidNewPass = validator.isLength(newPassword, { min: 6 });

  if (!isValidNewPass || newPassword !== confirmation) {
    throw ApiError.badRequest(
      'Invalid password or confirmation does not match'
    );
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

  const isValidNewEmail = validator.isEmail(newEmail);

  if (!isValidNewEmail || newEmail !== confirmation) {
    throw ApiError.badRequest(
      'Email is invalid or confirmation does not match'
    );
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
