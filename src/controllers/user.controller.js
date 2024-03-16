'use strict';

const { ApiError } = require('../exceptions/ApiError');
const userService = require('../services/user.service');
const categoryService = require('../services/category.service');
const expenseService = require('../services/expense.service');
const jwtService = require('../services/jwt.service');
const tokenService = require('../services/token.service');
const accountService = require('../services/account.service');
const {
  validateUsername,
  validatePassword,
  validateEmail,
} = require('../utils/validation');

const changeUsername = async(req, res) => {
  const { newUsername } = req.body;

  if (!validateUsername(newUsername)) {
    throw ApiError.BadRequest('Invalid request');
  }

  const userId = req.session.userId || req.user.id;

  await userService.changeUsername(userId, newUsername);

  const updatedUser = await userService.getById(userId);
  const normalizedUser = await userService.normalize(updatedUser);

  res.send(normalizedUser);
};

const changePassword = async(req, res) => {
  const { oldPassword, newPassword } = req.body;
  const isRequestValid = validatePassword(oldPassword)
    && validatePassword(newPassword);

  if (!isRequestValid) {
    throw ApiError.BadRequest('Invalid request');
  }

  const userId = req.session.userId || req.user.id;

  await userService.changePassword({
    userId, oldPassword, newPassword,
  });

  res.sendStatus(204);
};

const requestEmailChange = async(req, res) => {
  const { password, oldEmail, newEmail } = req.body;

  if (req.isAuthenticated()) {
    const isRequestValid = validateEmail(oldEmail)
    && validateEmail(newEmail);

    if (!isRequestValid) {
      throw ApiError.BadRequest('Invalid request');
    }

    await userService.requestEmailChange(null, oldEmail, newEmail);

    res.sendStatus(204);
  } else {
    const isRequestValid = validatePassword(password)
      && validateEmail(oldEmail)
      && validateEmail(newEmail);

    if (!isRequestValid) {
      throw ApiError.BadRequest('Invalid request');
    }

    await userService.requestEmailChange(password, oldEmail, newEmail);

    res.sendStatus(204);
  }
};

const changeEmail = async(req, res) => {
  const { newEmail } = req.body;

  if (!validateEmail(newEmail)) {
    throw ApiError.BadRequest('Invalid request');
  }

  const userId = req.session.userId || req.user.id;

  await userService.changeEmail({
    userId, newEmail,
  });

  const updatedUser = await userService.getById(userId);
  const normalizedUser = await userService.normalize(updatedUser);

  res.send(normalizedUser);
};

const getUserInfo = async(req, res) => {
  const userId = req.session.userId || req.user.id;
  const user = await userService.getById(userId);
  const normalized = await userService.normalize(user);

  res.send(normalized);
};

const deleteUser = async(req, res) => {
  const userId = req.session.userId || req.user.id;
  const user = await userService.getById(userId);

  if (!user) {
    throw ApiError.NotFound('User not found');
  }

  await expenseService.removeByUser(userId);
  await categoryService.removeAllByUser(userId);
  await accountService.removeAllByUser(userId);

  if (req.isAuthenticated()) {
    await req.logout((error) => {
      if (error) {
        throw error;
      }
    });
  } else {
    const { refreshToken } = req.cookies;
    const userData = jwtService.verifyRefresh(refreshToken);

    res.clearCookie('refreshToken');

    if (userData) {
      await tokenService.removeAll({ userId: userData.id });
    }
  }

  await userService.deleteUser(userId);

  res.sendStatus(204);
};

const deleteSocialAccount = async(req, res) => {
  const { accountType } = req.params;

  if (!accountType) {
    throw ApiError.BadRequest('Invalid request');
  }

  const userId = req.session.userId || req.user.id;
  const user = await userService.getById(userId);

  if (!user) {
    throw ApiError.NotFound('User not found');
  }

  if (user.authType === accountType) {
    throw ApiError.BadRequest('Invalid request');
  }

  await accountService.removeByType({
    type: accountType, userId,
  });

  res.sendStatus(204);
};

module.exports = {
  changeUsername,
  changePassword,
  requestEmailChange,
  changeEmail,
  getUserInfo,
  deleteUser,
  deleteSocialAccount,
};
