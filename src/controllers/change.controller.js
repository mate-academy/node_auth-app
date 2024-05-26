'use strict';

const { ApiError } = require('../exeptions/api.error');
const { isValidatedEmail } = require('../utils/isValidatedEmail.js');
const { isValidatedPassword } = require('../utils/isValidatedPassword.js');
const {
  findUserById,
  getHashPassword,
  comparePassword,
} = require('../services/user.service');
const {
  sendActivationEmail,
  sendNotificationEmail,
} = require('../services/mail.service.js');

async function postName(req, res) {
  const { userId } = req.params;
  const { newName } = req.body;

  const user = await findUserById(userId);

  if (!newName || newName.trim() === '') {
    throw ApiError.badRequest({ message: 'Name is invalid' });
  }

  user.name = newName;
  await user.save();

  res.send('success');
}

async function postEmail(req, res) {
  const { userId } = req.params;
  const { newEmail } = req.body;

  const user = await findUserById(userId);

  if (!newEmail || !isValidatedEmail(newEmail)) {
    throw ApiError.badRequest({ message: 'Email is invalid' });
  }

  await sendActivationEmail(newEmail, user.name);
  await sendNotificationEmail(user.email);

  user.email = newEmail;
  user.isActive = false;
  await user.save();

  res.send('success');
}

async function postPassword(req, res) {
  const { userId } = req.params;
  const { oldPassword, newPassword, confirmPassword } = req.body;

  const user = await findUserById(userId);

  if (
    !newPassword ||
    !isValidatedPassword(newPassword) ||
    newPassword !== confirmPassword
  ) {
    throw ApiError.badRequest({ message: 'password is invalid' });
  }

  if (newPassword === oldPassword) {
    throw ApiError.badRequest({ message: 'password is equal to old password' });
  }

  const result = await comparePassword(oldPassword, user.password);

  if (!result) {
    throw ApiError.badRequest({ message: 'incorect password' });
  }

  const hashPassword = await getHashPassword(newPassword);

  user.password = hashPassword;
  await user.save();

  res.send('success');
}

module.exports = {
  changeController: {
    postName,
    postEmail,
    postPassword,
  },
};
