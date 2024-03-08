'use strict';

const { ErrorApi } = require('../exceptions/ErrorApi.js');
const { validate } = require('../exceptions/validate.js');
const { bcryptService } = require('../services/bcryptService.js');
const { userService } = require('../services/userService.js');

async function changeName(req, res) {
  const { name } = req.body;
  const { id } = req.user;
  const errors = { name: validate.name(name) };

  if (errors.name) {
    throw ErrorApi.BadRequest('Validation error', errors);
  }

  await userService.changeName(id, name);

  res.sendStatus(200);
}

async function changePassword(req, res) {
  const { oldPassword, newPassword, confirmation } = req.body;
  const { id } = req.user;

  if (!oldPassword && !newPassword && !confirmation) {
    throw ErrorApi.BadRequest('All fields must be entered');
  }

  const errors = {
    newPasword: validate.password(newPassword),
    isEqual: newPassword === confirmation,
  };

  if (errors.newPasword || !errors.isEqual) {
    throw ErrorApi.BadRequest('Validation error', errors);
  }

  await userService.changePassword(id, oldPassword, newPassword);

  res.sendStatus(200);
}

async function confirmPassword(req, res) {
  const { password } = req.body;
  const { id } = req.user;

  if (!password) {
    throw ErrorApi.BadRequest('Password mustn\'t be empty');
  }

  const foundUser = await userService.getById(id);

  if (!foundUser) {
    throw ErrorApi.NotFound('user');
  }

  if (!(await bcryptService.isEquel(password, foundUser.password))) {
    throw ErrorApi.BadRequest('Password is wrong');
  }

  res.sendStatus(200);
}

async function changeEmailRequest(req, res) {
  const { newEmail } = req.body;
  const { id } = req.user;
  const errors = { email: validate.email(newEmail) };

  if (errors.email) {
    throw ErrorApi.BadRequest('Validation error', errors);
  }

  await userService.changeEmailRequest(id, newEmail);

  res.sendStatus(200);
}

async function activationEmail(req, res) {
  const { activetionToken, newEmail } = req.body;

  await userService.changeEmail(activetionToken, newEmail);

  res.sendStatus(200);
}

const userController = {
  changeName,
  changePassword,
  confirmPassword,
  changeEmailRequest,
  activationEmail,
};

module.exports = { userController };
