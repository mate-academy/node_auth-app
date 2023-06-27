'use strict';

const bcrypt = require('bcrypt');
const userService = require('../services/userService.js');
const emailService = require('../services/emailService.js');
const { ApiError } = require('../exceptions/ApiError.js');

async function getUserById(userId) {
  const user = await userService.getById(userId);

  if (!user) {
    throw ApiError.NotFound('User not found');
  }

  return user;
}

async function updateName(req, res) {
  const { name } = req.body;
  const { userId } = req.params;

  await getUserById(userId);

  if (!name) {
    throw ApiError.BadRequest('Name is required');
  }

  await userService.updateName(userId, name);

  res.send({ message: 'Name updated' });
}

async function updatePassword(req, res) {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const { userId } = req.params;

  const user = await getUserById(userId);

  const passwordError = userService.validatePassword(newPassword);

  if (passwordError || newPassword !== confirmPassword) {
    const errorMessage = newPassword !== confirmPassword
      ? 'Passwords do not match'
      : 'Password is invalid';

    throw ApiError.BadRequest(
      errorMessage,
      {
        password: passwordError,
      });
  }

  const validPassword = await bcrypt.compare(oldPassword, user.password);

  if (!validPassword) {
    throw ApiError.BadRequest('Incorrect old password');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await userService.updatePassword(user.id, hashedPassword);

  res.send({ message: 'Password updated' });
}

async function updateEmail(req, res) {
  const { currentPassword, newEmail, emailConfirmation } = req.body;
  const { userId } = req.params;

  const user = await getUserById(userId);

  const newEmailError = userService.validateEmail(newEmail);

  if (newEmailError || newEmail !== emailConfirmation) {
    const errorMessage = newEmail !== emailConfirmation
      ? 'Emails do not match'
      : 'Email is invalid';

    throw ApiError.BadRequest(
      errorMessage,
      {
        email: newEmailError,
      });
  }

  const validPassword = await bcrypt.compare(currentPassword, user.password);

  if (!validPassword) {
    throw ApiError.BadRequest('Password is invalid');
  }

  await userService.updateEmail(user.id, newEmail);

  await emailService.sendChangeEmailNotification({ email: newEmail });

  res.send({ message: 'Email updated' });
}

module.exports = {
  updateName,
  updatePassword,
  updateEmail,
};
