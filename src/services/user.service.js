'use strict';

const { ApiError } = require('../exceptions/errors');
const { Token } = require('../models/token');
const { User } = require('../models/user');
const emailService = require('../services/email.service');
const uuidv4 = require('uuid').v4;
const bcrypt = require('bcrypt');

async function getUserById(id) {
  const user = await User.findByPk(id);

  if (!user) {
    throw ApiError.notFound();
  };

  return user;
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

  const normalizedUser = normalize(user);

  return normalizedUser;
}

function normalize({ id, name, email }) {
  return {
    id,
    name,
    email,
  };
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
};

async function register({ name, email, password }) {
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

function generateRestorePassword() {
  return uuidv4();
}

async function restorePassword(email) {
  const user = await findByEmail(email);

  if (!user) {
    throw ApiError.notFound('User not found', {
      email: 'User not found',
    });
  }

  user.restoreCode = generateRestorePassword();
  user.save();

  await emailService.sendRestorePassword(email, user.restoreCode);
}

function updateName(userId, name) {
  return User.update({ name }, { where: { id: userId } });
}

function updatePassword(userId, password) {
  const hashedPassword = bcrypt.hashSync(password, 10);

  return User.update({
    password: hashedPassword,
  }, { where: { id: userId } });
}

function updateEmail(userId, email) {
  return User.update({ email }, { where: { id: userId } });
}

module.exports = {
  getUserById,
  getUser,
  normalize,
  findByEmail,
  register,
  restorePassword,
  updateName,
  updatePassword,
  updateEmail,
};
