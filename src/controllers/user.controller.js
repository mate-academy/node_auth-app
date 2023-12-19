'use strict';

const { jwtService } = require('../services/jwt.service');
const { mailService } = require('../services/mail.service');
const { tokenService } = require('../services/token.service');
const { userService } = require('../services/user.service');
const { ApiError } = require('../utils/api.error');
const { validators } = require('../utils/validators');

const updateName = async (req, res, next) => {
  const { refreshToken } = req.cookies;
  const { name } = req.body;

  const nameError = validators.validateName(name);

  if (nameError) {
    throw ApiError.BadRequest('Invalid name', { name: nameError });
  }

  const userData = jwtService.readRefreshToken(refreshToken);

  const user = await userService.findActiveUser(userData.email);
  const updatedUser = await userService.updateName(user, name);

  res.send(updatedUser);
};

const updatePassword = async (req, res, next) => {
  const { refreshToken } = req.cookies;
  const { password, newPassword } = req.body;

  const passwordError = validators.validatePassword(newPassword);

  if (passwordError) {
    throw ApiError.BadRequest('Invalid password', { password: passwordError });
  }

  const userData = jwtService.readRefreshToken(refreshToken);
  const user = await userService.findActiveUser(userData.email);

  await userService.checkPassword(password, user);
  await userService.updatePassword(user, newPassword);

  res.send({ message: 'Successfully changed password' });
};

const updateEmail = async (req, res, next) => {
  const { refreshToken } = req.cookies;
  const { password, newEmail } = req.body;

  const emailError = validators.validateEmail(newEmail);

  if (emailError) {
    throw ApiError.BadRequest('Invalid email', { email: emailError });
  }

  const userData = jwtService.readRefreshToken(refreshToken);
  const user = await userService.findActiveUser(userData.email);

  await userService.checkPassword(password, user);

  const activationToken = jwtService.generateToken();
  const oldEmail = user.email;

  await Promise.all([
    userService.updateEmail(user, newEmail, activationToken),
    tokenService.remove(user.id),
    mailService.sendActivationMail(newEmail, activationToken),
    mailService.sendChangeMail(oldEmail),
  ]);

  res.clearCookie('refreshToken');

  res.send({
    message: 'Email changed! Check your new email to activate your account!',
  });
};

exports.userController = {
  updateName,
  updatePassword,
  updateEmail,
};
