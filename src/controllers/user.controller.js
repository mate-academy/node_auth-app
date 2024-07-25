/* eslint-disable no-console */
const userService = require('../services/user.service.js');
const jwtService = require('../services/jwt.service.js');
const { ApiError } = require('../exceptions/api.error.js');
const validator = require('../utils/validation.js');
const bcrypt = require('bcrypt');
const emailService = require('../services/email.service.js');

const getUser = async (req, res) => {
  const { id } = req.params;
  const normalizedUser = await userService.getUser(id);

  res.send(normalizedUser);
};

const updateName = async (req, res) => {
  const { refreshToken } = req.cookies;
  const { newName } = req.body;

  const errors = validator.validateName(newName);

  if (errors) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(userData.email);

  if (!user) {
    throw ApiError.notFound({
      message: 'User not found',
    });
  }

  user.name = newName;
  await user.save();

  res.status(200).send(userService.normalize(user));
};

const updatePassword = async (req, res) => {
  const { refreshToken } = req.cookies;
  const { password, newPassword, confirmation } = req.body;

  const errors = {
    password: validator.validatePassword(password),
    newPassword: validator.validatePassword(newPassword),
    confirmation: validator.validatePassword(confirmation),
  };

  if (errors.password || errors.newPassword || errors.confirmation) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(userData.email);

  if (!user) {
    throw ApiError.notFound({
      message: 'User not found',
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password', {
      password: `Wrong password`,
    });
  }

  if (newPassword !== confirmation) {
    throw ApiError.badRequest('Passwords are not equal');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  await user.save();

  res.status(200).send(userService.normalize(user));
};

const updateEmail = async (req, res) => {
  const { refreshToken } = req.cookies;
  const { password, newEmail } = req.body;

  const errors = {
    password: validator.validatePassword(password),
    newEmail: validator.validateEmail(newEmail),
  };

  if (errors.password || errors.newEmail) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(userData.email);

  console.log('userData', userData);

  if (!user) {
    throw ApiError.notFound({
      message: 'User not found',
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password', {
      password: `Wrong password`,
    });
  }

  await emailService.sendChangeEmail(newEmail);

  res.sendStatus(204);
};

const updateEmailConfirm = async (req, res) => {
  const { refreshToken } = req.cookies;
  const { newEmail } = req.params;

  const errors = {
    newEmail: validator.validateEmail(newEmail),
  };

  if (errors.newEmail) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(userData.email);

  if (!user) {
    throw ApiError.notFound({
      message: 'User not found',
    });
  }

  await emailService.sendNotificationToOldEmail(user.email, newEmail);

  user.email = newEmail;
  await user.save();

  res.status(200).send(userService.normalize(user));
};

module.exports = {
  getUser,
  updateName,
  updatePassword,
  updateEmail,
  updateEmailConfirm,
};
