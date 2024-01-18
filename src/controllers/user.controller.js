'use strict';

const { ApiError } = require('../exceptions/ApiError');
const userService = require('../services/user.service');
const { sendNewEmail } = require('../services/email.service');
const { validatePassword, validateEmail } = require('./auth.controller');
const bcrypt = require('bcrypt');

async function edit(req, res) {
  const { name } = req.body;
  const { id } = req.user;

  if (!name) {
    throw ApiError.BadRequest('Name is required');
  }

  await userService.edit({
    id, name,
  });

  const user = await userService.getById(id);

  res.send(userService.normalize(user));
}

async function changePassword(req, res) {
  const { newPassword, oldPassword } = req.body;
  const { email } = req.user;
  const user = await userService.getByEmail(email);

  const errors = {
    newPassword: validatePassword(newPassword),
    oldPassword: validatePassword(oldPassword),
  };

  if (errors.newPassword || errors.oldPassword) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Password is wrong');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.sendStatus(204);
}

async function changeEmail(req, res) {
  const { password, newEmail } = req.body;
  const { id } = req.user;

  const user = await userService.getById(id);

  const oldEmail = user.email;

  const errors = {
    password: validatePassword(password),
    newEmail: validateEmail(newEmail),
  };

  if (oldEmail === newEmail) {
    throw ApiError.BadRequest('New email must be different from old email');
  }

  if (errors.password || errors.newEmail) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Password is wrong');
  }

  user.email = newEmail;
  await user.save();

  await sendNewEmail(oldEmail, newEmail);
  await sendNewEmail(newEmail, newEmail);

  res.send(userService.normalize(user));
}

module.exports = {
  edit,
  changePassword,
  changeEmail,
};
