'use strict';

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const { User } = require('../models/User.js');
const { emailService } = require('./emailService.js');
const { ApiError } = require('../exceptions/ApiError.js');

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    throw ApiError.BadRequest('Email is required', {
      email: 'Email is required',
    });
  } else if (!emailRegex.test(email)) {
    throw ApiError.BadRequest('Email is invalid', {
      email: 'Email is invalid',
    });
  }
}

function validatePassword(password) {
  if (!password || password.length < 6) {
    const errMsg = !password ? 'Password is required' : 'Password is too short';

    throw ApiError.BadRequest(errMsg, { password: errMsg });
  }
}

function getByEmail(email) {
  return User.findOne({ where: { email } });
}

function getById(userId) {
  return User.findByPk(userId);
}

async function register({ name, email, password }) {
  const existingUser = await getByEmail(email);

  if (existingUser) {
    throw ApiError.BadRequest('User already exists', {
      email: 'User already exists',
    });
  }

  const activationToken = uuidv4();
  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    email,
    password: hashedPassword,
    name,
    activationToken,
  });

  await emailService.sendActivationLink({
    email,
    activationToken,
  });
}

function generateRestorePasswordToken() {
  return uuidv4();
}

function normalize({ id, email }) {
  return {
    id,
    email,
  };
}

function updateName(userId, name) {
  return User.update({ name }, { where: { id: userId } });
}

function updatePassword(userId, password) {
  return User.update({ password }, { where: { id: userId } });
}

function updateEmail(userId, email) {
  return User.update({ email }, { where: { id: userId } });
}

module.exports = {
  validatePassword,
  validateEmail,
  normalize,
  register,
  generateRestorePasswordToken,
  getByEmail,
  getById,
  updateName,
  updatePassword,
  updateEmail,
};
