'use strict';

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const ApiError = require('../exception/api.error');
const emailService = require('../services/email.service');
const authService = require('../services/auth.service');
const userService = require('../services/user.service');

const changeName = async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    throw ApiError.notFound({ user: userId });
  }

  const { name } = req.body;

  if (!name) {
    throw ApiError.badRequest('Name is required', {
      name: 'Name is required',
    });
  }

  const user = await userService.findByID(userId);

  user.name = name;
  await user.save();

  res.status(200).send('User name successfully updated');
};

const changePass = async (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword, acceptNewPassword } = req.body;

  if (!userId) {
    throw ApiError.notFound({ userID: userId });
  }

  const user = await userService.findByID(userId);

  if (!oldPassword || !newPassword || !acceptNewPassword) {
    throw ApiError.badRequest('all fields must be filled in', {
      error: 'all fields must be filled in',
    });
  }

  const correctPass = authService.validatePassword(acceptNewPassword);

  if (correctPass) {
    throw ApiError.badRequest('Bad request', { password: correctPass });
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password', {
      error: 'Wrong password',
    });
  }

  if (newPassword !== acceptNewPassword) {
    throw ApiError.badRequest('New passwords must match', {
      error: 'New passwords must match',
    });
  }

  const hashedPass = await bcrypt.hash(acceptNewPassword, 5);

  user.password = hashedPass;
  await user.save();

  res.status(200).send('User password successfully updated');
};

const changeEmail = async (req, res) => {
  const userId = req.user.id;
  const { password, newEmail } = req.body;

  const correctEmail = authService.validateEmail(newEmail);

  if (correctEmail) {
    throw ApiError.badRequest('Bad request', { email: correctEmail });
  }

  if (!userId) {
    throw ApiError.notFound({ userID: userId });
  }

  const user = await userService.findByID(userId);

  if (!password || !newEmail) {
    throw ApiError.badRequest('all fields must be filled in', {
      error: 'all fields must be filled in',
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password', {
      error: 'Wrong password',
    });
  }

  const activationToken = uuidv4();

  await emailService.sendActivationEmail(newEmail, activationToken);

  await emailService.sendEmailUpdateEmail(user.email);

  user.activationToken = activationToken;
  user.email = newEmail;
  await user.save();

  res.status(200).send(
    'Email update initiated. Please check your new email for confirmation.'
  );
};

module.exports = {
  changeName,
  changePass,
  changeEmail,
};
