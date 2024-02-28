'use strict';

const { ApiError } = require('../exceptions/ApiError');
const userService = require('../services/user.service');
const {
  validateUsername,
  validatePassword,
  validateEmail,
} = require('../utils/validation');

const changeUsername = async(req, res) => {
  const { userId, newUsername } = req.body;
  const isRequestValid = userId && typeof userId === 'string'
    && validateUsername(newUsername);

  if (!isRequestValid) {
    throw ApiError.BadRequest('Invalid request');
  }

  await userService.changeUsername(userId, newUsername);

  const updatedUser = await userService.getById(userId);

  res.send(updatedUser);
};

const changePassword = async(req, res) => {
  const { userId, oldPassword, newPassword } = req.body;
  const isRequestValid = userId && typeof userId === 'string'
    && validatePassword(oldPassword)
    && validatePassword(newPassword);

  if (!isRequestValid) {
    throw ApiError.BadRequest('Invalid request');
  }

  await userService.changePassword({
    userId, oldPassword, newPassword,
  });

  res.sendStatus(204);
};

const requestEmailChange = async(req, res) => {
  const { password, oldEmail, newEmail } = req.body;
  const isRequestValid = validatePassword(password)
    && validateEmail(oldEmail)
    && validateEmail(newEmail);

  if (!isRequestValid) {
    throw ApiError.BadRequest('Invalid request');
  }

  await userService.requestEmailChange(password, oldEmail, newEmail);

  res.sendStatus(204);
};

const changeEmail = async(req, res) => {
  const { userId, newEmail } = req.body;

  if (typeof userId !== 'string' || !validateEmail(newEmail)) {
    throw ApiError.BadRequest('Invalid request');
  }

  await userService.changeEmail({
    userId, newEmail,
  });

  const updatedUser = await userService.getById(userId);

  res.send(updatedUser);
};

module.exports = {
  changeUsername,
  changePassword,
  requestEmailChange,
  changeEmail,
};
