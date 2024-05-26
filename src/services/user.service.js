'use strict';

const bcrypt = require('bcrypt');
const { ApiError } = require('../exeptions/api.error.js');
const { User } = require('../models/user.model.js');

function getHashPassword(password) {
  return bcrypt.hash(password, 3);
}

function comparePassword(oldPassword, newPassword) {
  return bcrypt.compare(oldPassword, newPassword);
}

async function createUser(name, email, password) {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw ApiError.badRequest({ message: 'User already exists' });
  }

  const hashPassword = await getHashPassword(password);

  return User.create({ name, email, password: hashPassword });
}

async function findUserByEmail(email) {
  const user = await User.findOne({ email });

  if (!user) {
    throw ApiError.badRequest({ message: 'user not found' });
  }

  return user;
}

async function activateUser(user) {
  user.isActive = true;
  await user.save();
}

async function verifyPassword(password, hash) {
  const result = await bcrypt.compare(password, hash);

  if (!result) {
    throw ApiError.badRequest({ message: 'incorect password' });
  }
}

async function updateUserTokens(user, accessToken, refreshToken) {
  updateAccessToken(user, accessToken);
  updateRefreshToken(user, refreshToken);

  await user.save();
}

function updateAccessToken(user, accessToken) {
  user.accsessToken = accessToken;
}

function updateRefreshToken(user, refreshToken) {
  user.refreshToken = refreshToken;
}

async function findUserById(userId) {
  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.badRequest({ message: 'User not found' });
  }

  return user;
}

async function updateAccessTokenOnly(user, accsessToken) {
  user.accsessToken = accsessToken;
  await user.save();
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  activateUser,
  verifyPassword,
  updateUserTokens,
  updateAccessToken,
  updateAccessTokenOnly,
  getHashPassword,
  comparePassword,
};
