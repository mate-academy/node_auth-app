const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const { User } = require('../models/user');
const { emailService } = require('./email.service');
const { ApiError } = require('../exeptions/api.error');
const { Op } = require('sequelize');

async function requestReset(email) {
  const user = await User.findOne({ where: { email } });

  // If the user is not found, return true for security
  // eslint-disable-next-line max-len
  // (so as not to reveal information about the existence of an email in the system)
  if (!user) {
    return true;
  }

  // reset token generation
  const resetPasswordToken = uuidv4();
  const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 година

  // save token for user
  user.resetPasswordToken = resetPasswordToken;
  user.resetPasswordExpires = resetPasswordExpires;
  await user.save();

  // send email
  await emailService.sendPasswordResetEmail(email, resetPasswordToken);

  return true;
}

async function verifyResetToken(token) {
  const user = await User.findOne({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: { [Op.gt]: new Date() },
    },
  });

  if (!user) {
    return null;
  }

  return user;
}

async function checkPasswordValid(hashedPassword, plainPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function updatePassword(token, password) {
  const user = await User.findOne({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: { [Op.gt]: new Date() },
    },
  });

  if (!user) {
    throw ApiError.badRequest(
      'The password reset token is invalid or has expired.',
    );
  }

  // update password
  const hashedPassword = await hashPassword(password);

  user.password = hashedPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  return true;
}

async function updateProfilePassword(userId, oldPassword, newPassword) {
  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isPasswordValid = await checkPasswordValid(user.password, oldPassword);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Invalid current password');
  }

  const hashedPassword = await hashPassword(newPassword);

  user.password = hashedPassword;
  await user.save();

  return true;
}

const passwordService = {
  requestReset,
  verifyResetToken,
  updatePassword,
  checkPasswordValid,
  updateProfilePassword,
};

module.exports = { passwordService };
