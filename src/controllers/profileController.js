'use strict';

const bcrypt = require('bcrypt');
const userService = require('../services/userService.js');
const emailService = require('../services/emailService.js');
const { ApiError } = require('../exceptions/ApiError.js');

async function updateName(req, res) {
  const { name } = req.body;
  const { id } = req.user;

  if (!name) {
    throw ApiError.BadRequest('Name is required');
  }

  await userService.updateName(id, name);

  res.send({ message: 'Name updated' });
}

async function updatePassword(req, res) {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const { user } = req;

  // Verifying the old password
  const validPassword = await bcrypt.compare(oldPassword, user.password);

  if (!validPassword) {
    throw ApiError.BadRequest('Password is invalid');
  }

  if (newPassword !== confirmPassword) {
    throw ApiError.BadRequest('Passwords do not match');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await userService.updatePassword(user.id, hashedPassword);

  res.send({ message: 'Password updated' });
}

async function updateEmail(req, res) {
  const { currentPassword, newEmail, emailConfirmation } = req.body;
  const { user } = req.user;

  const validPassword = await bcrypt.compare(
    currentPassword,
    user.password
  );

  if (!validPassword) {
    throw ApiError.BadRequest('Password is invalid');
  }

  if (newEmail !== emailConfirmation) {
    throw ApiError.BadRequest('Emails do not match');
  }

  await userService.updateEmail(user.id, newEmail);

  emailService.sendChangeEmailNotification({ email: req.user.email });

  res.send({ message: 'Email updated' });
}

module.exports = {
  updateName,
  updatePassword,
  updateEmail,
};
