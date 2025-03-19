'use strict';

const { v4 } = require('uuid');
const bcrypt = require('bcrypt');

const { ApiError } = require('../exceptions/ApiError');
const { User } = require('../models/User');
const emailService = require('./emailService');
const tokenService = require('./tokenService');

function normalize({ id, name, email }) {
  return {
    id,
    name,
    email,
  };
}

function getByEmail(email) {
  return User.findOne({
    where: { email },
  });
}

async function registration({ name, email, password }) {
  const isExist = await User.findOne({ where: { email } });

  if (isExist) {
    throw ApiError.BadRequest('User with such email already exist');
  }

  const confirmEmailToken = v4();
  const hash = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hash,
    confirmEmailToken,
  });

  await emailService.sendActivationMail(email, confirmEmailToken);
};

async function sendResetPasswordMail(email) {
  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('User not found');
  }

  const confirmEmailToken = v4();

  user.confirmEmailToken = confirmEmailToken;
  await user.save();

  await emailService.sendResetMail(email, confirmEmailToken);
}

async function resetPassword(password, confirmEmailToken) {
  const user = await User.findOne({ where: { confirmEmailToken } });

  if (!user) {
    throw ApiError.BadRequest('User not found');
  }

  const hash = await bcrypt.hash(password, 10);

  user.password = hash;
  user.confirmEmailToken = null;
  user.save();
}

async function updateName(id, name) {
  const user = await User.findOne({ where: { id } });

  user.name = name;
  await user.save();

  return normalize(user);
}

async function updateEmail(id, email) {
  const isExist = await User.findOne({ where: { email } });

  if (isExist) {
    throw ApiError.BadRequest('User with such email already exist');
  }

  const user = await User.findOne({ where: { id } });
  const confirmEmailToken = v4();
  const oldEmail = user.email;

  user.email = email;
  user.confirmEmailToken = confirmEmailToken;

  await user.save();
  await tokenService.remove(id);

  await emailService.sendActivationMail(email, confirmEmailToken);
  await emailService.sendChangeMail(oldEmail);
}

async function updatePassword(id, password) {
  const user = await User.findOne({ where: { id } });

  const hash = await bcrypt.hash(password, 10);

  user.password = hash;

  await user.save();
  await tokenService.remove(id);
}

const userService = {
  normalize,
  getByEmail,
  registration,
  sendResetPasswordMail,
  resetPassword,
  updateName,
  updateEmail,
  updatePassword,
};

module.exports = userService;
