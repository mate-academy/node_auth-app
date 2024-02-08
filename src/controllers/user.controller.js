'use strict';

const { ApiError } = require('../exceptions/api.error');
const { userService } = require('../services/user.service');
const {
  validateConfirmPassword,
  validateEmail,
  validatePassword,
  validateUsername,
} = require('../utils/validation');

const getAllActivated = async(req, res) => {
  const users = await userService.getAllActivated();

  res.send(users.map(user => userService.normalize(user)));
};

const getUserById = async(req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw ApiError.BadRequest('Not enough or wrong data');
  }

  const user = await userService.getById(userId);

  if (!user) {
    throw ApiError.NotFound({ user: 'Requested user doesn\'t found' });
  }

  res.send(userService.normalize(user));
};

const changeUsernameById = async(req, res) => {
  const { userId } = req.params;
  const { username } = req.body;

  if (!userId || !username) {
    throw ApiError.BadRequest('Not enough or wrong data');
  }

  const errors = {
    username: validateUsername(username),
  };

  if (errors.username) {
    throw ApiError.BadRequest('Bad request', errors);
  }

  await userService.updateUsernameById(userId, username);

  res.sendStatus(204);
};

const changePassword = async(req, res) => {
  const { userId } = req.params;
  const {
    oldPassword,
    newPassword,
    confirmationPassword,
  } = req.body.changePasswordData;

  if (!userId || !oldPassword || !newPassword || !confirmationPassword) {
    throw ApiError.BadRequest('Not enough or wrong data');
  }

  const errors = {
    oldPassword: validatePassword(oldPassword || ''),
    newPassword: validatePassword(newPassword || ''),
    confirmPassword: validateConfirmPassword(newPassword, confirmationPassword),
  };

  if (errors.oldPassword || errors.newPassword) {
    throw ApiError.BadRequest('Bad request', errors);
  }

  await userService.updatePasswordById(userId, {
    oldPassword, newPassword,
  });

  res.sendStatus(204);
};

const changeEmail = async(req, res) => {
  const { userId } = req.params;
  const changeUserEmailData = req.body;
  const { userEmail, userEmailConfirmationPassword } = changeUserEmailData;

  if (!userId || !userEmail || !userEmailConfirmationPassword) {
    throw ApiError.BadRequest('Not enough or wrong data');
  }

  const errors = {
    email: validateEmail(userEmail || ''),
    password: validatePassword(userEmailConfirmationPassword || ''),
  };

  if (errors.email || errors.password) {
    throw ApiError.BadRequest('Bad request', errors);
  }

  await userService.updateEmailById(userId, changeUserEmailData);

  res.sendStatus(204);
};

const userController = {
  getAllActivated,
  getUserById,
  changeUsernameById,
  changePassword,
  changeEmail,
};

module.exports = { userController };
