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
  }

  if (!emailRegex.test(email)) {
    throw ApiError.BadRequest('Email is invalid', {
      email: 'Email is invalid',
    });
  }
}

function validatePassword(password) {
  if (!password) {
    throw ApiError.BadRequest('Password is required', {
      password: 'Password is required',
    });
  }

  if (password.length < 6) {
    throw ApiError.BadRequest('Password is too short', {
      password: 'Password is too short',
    });
  }
}

function getByEmail(email) {
  return User.findOne({ where: { email } });
}

async function register({ name, email, password }) {
  const existingUser = getByEmail(email);

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

module.exports = {
  validatePassword,
  validateEmail,
  register,
};
