'use strict';

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const { ApiError } = require('../exceptions/api.error');
const { User } = require('../models/User');
const { emailService } = require('./email.service');

function getAllActivated() {
  return User.findAll({ where: { activationToken: null } });
};

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

function normalize({ id, email, username }) {
  return {
    id, email, username,
  };
};

async function register(email, password, username) {
  const existUser = await findByEmail(email);

  if (existUser && existUser.activationToken === null) {
    throw ApiError.Conflict({
      email: 'Unfortunately user with this email already exist',
    });
  }

  const activationToken = uuidv4();

  if (existUser && existUser.activationToken !== null) {
    await User.update({
      password, username, activationToken,
    }, { where: { email } });
  } else {
    await User.create({
      email, password, username, activationToken,
    });
  }

  await emailService.sendActivationEmail(email, activationToken);
};

async function activateNewUser(activationToken) {
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    throw ApiError.NotFound('No such user');
  }

  user.activationToken = null;
  await user.save();

  return user;
};

async function getById(id) {
  const user = await User.findByPk(id);

  return user;
}

async function updateUsernameById(id, username) {
  const user = await userService.getById(id);

  if (!user) {
    throw ApiError.NotFound('No such user');
  }

  await User.update({ username }, { where: { id } });
}

async function updatePasswordById(id, changePasswordData) {
  const { oldPassword, newPassword } = changePasswordData;
  const user = await userService.getById(id);

  if (!user) {
    throw ApiError.BadRequest('No such user');
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Wrong password');
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedNewPassword;

  await user.save();
};

async function updateEmailById(id, changeUserEmailData) {
  const { userEmail, userEmailConfirmationPassword } = changeUserEmailData;
  const isEmailUsed = await userService.findByEmail(userEmail);

  if (isEmailUsed) {
    throw ApiError.Conflict({
      email: 'Unfortunately user with this email already exist',
    });
  }

  const user = await userService.getById(id);

  if (!user) {
    throw ApiError.BadRequest('No such user');
  }

  const isPasswordValid
    = await bcrypt.compare(userEmailConfirmationPassword, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Wrong password');
  }

  const confirmationToken = uuidv4();

  user.confirmationToken = confirmationToken;
  user.newEmail = userEmail;

  await user.save();

  await emailService.sendConfirmationEmail(userEmail, confirmationToken);
};

async function updateEmailByConfirmationToken(confirmationToken) {
  const user = await User.findOne({ where: { confirmationToken } });

  if (!user) {
    throw ApiError.NotFound('No such user');
  }

  const oldEmail = user.email;
  const newEmail = user.newEmail;

  user.email = user.newEmail;
  user.confirmationToken = null;
  user.newEmail = null;

  await user.save();

  await emailService.sendNotifyingChangingEmail(oldEmail, newEmail);

  return user;
};

async function resetPasswordByEmail(email) {
  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('No such user');
  }

  const resettingPasswordToken = uuidv4();

  user.resettingPasswordToken = resettingPasswordToken;

  await user.save();

  await emailService.sendResettingPasswordEmail(email, resettingPasswordToken);
};

async function confirmResetPasswordByToken(
  confirmationResetToken, newPassword) {
  const user = await User.findOne({
    where: { resettingPasswordToken: confirmationResetToken },
  });

  if (!user) {
    throw ApiError.BadRequest('No such user');
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedNewPassword;
  user.resettingPasswordToken = null;

  await user.save();
};

const userService = {
  getAllActivated,
  normalize,
  findByEmail,
  register,
  activateNewUser,
  getById,
  updateUsernameById,
  updatePasswordById,
  updateEmailById,
  updateEmailByConfirmationToken,
  resetPasswordByEmail,
  confirmResetPasswordByToken,
};

module.exports = { userService };
