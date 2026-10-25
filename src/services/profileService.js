'use strict';

const { User } = require('../models');
const cryptoUtils = require('../utils/crypto');
const tokenService = require('./tokenService');
const mailService = require('./mailService');

function isPasswordValid(user, password) {
  return cryptoUtils.verifyPassword(password, user.passwordHash);
}

async function isEmailTaken(email) {
  const found = await User.findOne({ where: { email } });

  return Boolean(found);
}

async function updateName(user, userName) {
  user.name = userName;
  await user.save();
}

async function changePassword(user, newPassword) {
  user.passwordHash = await cryptoUtils.hashPassword(newPassword);
  user.tokenVersion += 1; // drops the other sessions
  await user.save();
  await tokenService.removeAll(user.id, 'reset');
  mailService.sendPasswordChanged(user);
}

async function changeEmail(user, newEmail) {
  const oldEmail = user.email;

  user.email = newEmail;
  await user.save();
  await tokenService.removeAll(user.id, 'reset');
  mailService.sendEmailChanged(user, oldEmail);
}

module.exports = {
  isPasswordValid,
  isEmailTaken,
  updateName,
  changePassword,
  changeEmail,
};
