'use strict';

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const ApiError = require('../exception/api.error');
const { User } = require('../models/User.model');
const emailService = require('../services/email.service');

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

  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.notFound({ user: user });
  }

  user.name = name;
  await user.save();

  res.status(200).send('The name updated');
};

const changePass = async (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword, acceptNewPassword } = req.body;

  if (!userId) {
    throw ApiError.notFound({ userID: userId });
  }

  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.notFound({ user: user });
  }

  if (!oldPassword || !newPassword || !acceptNewPassword) {
    throw ApiError.badRequest('all fields must be filled in', {
      error: 'all fields must be filled in',
    });
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

  res.status(200).send('The password updated');
};

const changeEmail = async (req, res) => {
  const userId = req.user.id;
  const { password, newEmail } = req.body;

  if (!userId) {
    throw ApiError.notFound({ userID: userId });
  }

  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.notFound({ user: user });
  }

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

  res.status(200).send('The email updated. You should check your new email');
};

module.exports = {
  changeName,
  changePass,
  changeEmail,
};
