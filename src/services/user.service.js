'use strict';

const { ApiError } = require('../exceptions/api.error');
const { User } = require('../models/user');
const uuidv4 = require('uuid').v4;
const bcrypt = require('bcrypt');
const emailService = require('../services/email.service');
const { Token } = require('../models/token');
const validator = require('../utils/validators');

async function getUserById(id) {
  const user = await User.findByPk(id);

  if (!user) {
    throw ApiError.notFound();
  };

  return User.findByPk(id);
}

function normalizeUser({ id, name, email }) {
  return {
    id,
    name,
    email,
  };
}

function findByEmail(email) {
  return User.findOne({
    where: {
      email,
    },
  });
}

async function registration({ name, email, password }) {
  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exist', {
      email: 'User already exist',
    });
  }

  const activationToken = uuidv4();
  const hashedPass = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hashedPass,
    activationToken,
  });

  await emailService.sendActivationEmail(email, activationToken);
}

async function resetPassword(email) {
  const user = await findByEmail(email);

  if (!user) {
    throw ApiError.notFound('User notfound', {
      email: 'Check your email',
    });
  }

  user.resetToken = uuidv4();
  user.save();

  await emailService.sendResetPasswordEmail(email, user.resetToken);
}

async function getUser(userId) {
  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.notFound();
  };

  const isLogged = await Token.findOne({ where: { userId } });

  if (!isLogged) {
    throw ApiError.unauthorized();
  };

  const normalizedUser = normalizeUser(user);

  return normalizedUser;
}

async function updateName(id, name) {
  const user = await getUserById(id);

  const isValidName = validator.username(name);

  if (!isValidName || name === user.name) {
    throw ApiError.badRequest('Invalid name');
  };

  user.name = name;
  user.save();
}

async function updateEmail(id, email, password) {
  const user = await User.findByPk(id);
  const isPasswordValid = await bcrypt.compare(password, user.password)
    ? null
    : 'Invalid password';
  const isNewEmail = email === user.email ? 'Same email' : null;

  const errors = {
    email: validator.email(email) || isNewEmail,
    password: isPasswordValid,
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest('Something went wrong', errors);
  };

  const activationToken = uuidv4();

  user.activationToken = activationToken;
  user.newEmail = email;
  user.save();

  await emailService.sendNewEmailActivation(email, activationToken, id);
}

async function updatePassword(
  id,
  password,
  newPassword,
  confirmation
) {
  const user = await User.findByPk(id);
  const isPasswordValid = await bcrypt.compare(password, user.password)
    ? null
    : 'Invalid password';

  const isNewPasswordValid = await validator.newPassword(
    password,
    newPassword,
    confirmation);

  const errors = {
    password: isPasswordValid,
    newPassword: isNewPasswordValid,
  };

  if (errors.password || errors.newPassword) {
    throw ApiError.badRequest('Change password error', errors);
  }

  const hashedNewPas = await bcrypt.hash(newPassword, 10);

  user.password = hashedNewPas;
  user.save();
}

module.exports = {
  registration,
  findByEmail,
  normalizeUser,
  resetPassword,
  getUser,
  updateName,
  updateEmail,
  updatePassword,
};
