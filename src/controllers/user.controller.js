'use strict';

const userService = require('../services/user.service');

const changeUsername = async(req, res) => {
  const { userId, newUsername } = req.body;

  await userService.changeUsername(userId, newUsername);

  const updatedUser = await userService.getById(userId);

  res.send(updatedUser);
};

const changePassword = async(req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  await userService.changePassword({
    userId, oldPassword, newPassword,
  });

  res.sendStatus(204);
};

const requestEmailChange = async(req, res) => {
  const { password, oldEmail, newEmail } = req.body;

  await userService.requestEmailChange(password, oldEmail, newEmail);

  res.send(204);
};

const changeEmail = async(req, res) => {
  const { token, id, newEmail } = req.query;

  await userService.changeEmail({
    token, id, newEmail,
  });

  const updatedUser = await userService.getById(id);

  res.send(updatedUser);
};

module.exports = {
  changeUsername,
  changePassword,
  requestEmailChange,
  changeEmail,
};
