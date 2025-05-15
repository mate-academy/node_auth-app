const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { ApiError } = require('../exceptions/api.error.js');
const { emailService } = require('./email.service.js');
const { userService } = require('./user.service.js');

function validateEmail(email) {
  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!email) {
    return 'Email is required';
  }

  if (!emailPattern.test(email)) {
    return 'Email is not valid';
  }
}

function validatePassword(password) {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 6) {
    return 'At least 6 characters';
  }
}

function hashPassword(password) {
  const saltRounds = 10;

  return bcrypt.hash(password, saltRounds);
}

async function resetPassword(email) {
  const resetToken = uuidv4();
  const existUser = await userService.findByEmail(email);

  if (!existUser) {
    throw ApiError.badRequest('No such user');
  }

  existUser.resetToken = resetToken;
  await existUser.save();
  await emailService.sendResetEmail(email, resetToken);
}

exports.authService = {
  validateEmail,
  validatePassword,
  hashPassword,
  resetPassword,
};
