'use strict';

const { randomUUID } = require('node:crypto');

const { ApiError } = require('../utils/ApiError.js');
const { mailer } = require('../utils/mailer.js');
const { assertValid } = require('../utils/validation.js');
const { userService } = require('../services/user.service.js');
const { authService } = require('../services/auth.service.js');
const { usersRepository } = require('../entity/users.repository.js');

async function getCurrentUser(req) {
  if (!req.user?.id) {
    throw ApiError.unauthorized('Access token is required');
  }

  const user = await usersRepository.getById(req.user.id);

  if (!user) {
    throw ApiError.notFound('The account does not exist anymore');
  }

  return user;
}

const get = async (req, res) => {
  const user = await getCurrentUser(req);

  res.send({ user: userService.normalize(user) });
};

const updateName = async (req, res) => {
  const { name } = req.body;

  assertValid({ name: userService.validateName(name) });

  const user = await getCurrentUser(req);
  const updatedUser = await usersRepository.update(user.id, { name });

  res.send({ user: userService.normalize(updatedUser) });
};

const updatePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmation } = req.body;

  assertValid({
    oldPassword: oldPassword ? undefined : 'Old password is required',
    newPassword: userService.validatePassword(newPassword),
    confirmation: userService.validateConfirmation(newPassword, confirmation),
  });

  const user = await getCurrentUser(req);
  const isPasswordValid = await authService.comparePasswords(
    oldPassword,
    user.password,
  );

  if (!isPasswordValid) {
    throw ApiError.badRequest('Validation error', {
      oldPassword: 'Wrong password',
    });
  }

  await usersRepository.update(user.id, {
    password: await authService.hashPassword(newPassword),
  });

  res.send({ message: 'The password has been changed' });
};

const requestEmailChange = async (req, res) => {
  const { password, newEmail } = req.body;

  assertValid({
    password: password ? undefined : 'Password is required',
    newEmail: userService.validateEmail(newEmail),
  });

  const user = await getCurrentUser(req);
  const isPasswordValid = await authService.comparePasswords(
    password,
    user.password,
  );

  if (!isPasswordValid) {
    throw ApiError.badRequest('Validation error', {
      password: 'Wrong password',
    });
  }

  if (newEmail === user.email) {
    throw ApiError.badRequest('Validation error', {
      newEmail: 'This is your current email',
    });
  }

  const emailOwner = await usersRepository.getByEmail(newEmail);

  if (emailOwner) {
    throw ApiError.badRequest('Validation error', {
      newEmail: 'Email is already taken',
    });
  }

  const emailChangeToken = randomUUID();

  await usersRepository.update(user.id, { newEmail, emailChangeToken });

  await mailer.sendEmailChangeConfirmation(newEmail, emailChangeToken);
  await mailer.sendEmailChangeNotification(user.email, newEmail);

  res.send({ message: 'Check your new email to confirm the change' });
};

module.exports = {
  profileController: {
    get,
    updateName,
    updatePassword,
    requestEmailChange,
  },
};
