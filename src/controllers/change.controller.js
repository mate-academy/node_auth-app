'use strict';

const { ApiError } = require('../exeptions/api.error');
const { User } = require('../models/user.model');
const { isValidatedEmail } = require('../utils/isValidatedEmail.js');
const { isValidatedPassword } = require('../utils/isValidatedPassword.js');
const { sendMail } = require('../services/sendMail.js');
const { token } = require('../services/token.js');
const bcrypt = require('bcrypt');

async function postName(req, res) {
  const { userId } = req.params;
  const { newName } = req.body;

  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.badRequest({ message: 'User not found' });
  }

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

  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.badRequest({ message: 'User not found' });
  }

  if (!newEmail || !isValidatedEmail(newEmail)) {
    throw ApiError.badRequest({ message: 'Email is invalid' });
  }

  const payload = { name: user.name, email: newEmail };
  const activateToken = token.getToken(payload, 'activate');

  const url = `http://localhost:3005/activation/${activateToken}`;

  await sendMail(newEmail, url);

  await sendMail(newEmail, url, {
    message: `Your email has been changed successfully on ${newEmail}`,
    subject: 'notification',
    status: true,
  });

  user.email = newEmail;
  user.isActive = false;
  await user.save();

  res.send('success');
}

async function postPassword(req, res) {
  const { userId } = req.params;
  const { oldPassword, newPassword, confirmPassword } = req.body;

  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.badRequest({ message: 'User not found' });
  }

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

  const result = await bcrypt.compare(oldPassword, user.password);

  if (!result) {
    throw ApiError.badRequest({ message: 'incorect password' });
  }

  const hashPassword = await bcrypt.hash(newPassword, 3);

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
