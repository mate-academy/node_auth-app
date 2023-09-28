'use strict';

const crypto = require('crypto');
const usersService = require('../services/users');

// Define constants for minimum password length
const MIN_PASSWORD_LENGTH = 6;

function validateUsername(value) {
  if (!value) {
    return 'Username is required';
  }
}

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
}

async function validateEmailChange(email, id) {
  const existedUser = await usersService.getOneByField({ email });

  if (existedUser && existedUser.id !== +id) {
    return 'User with this email already exists';
  }

  return validateEmail(email);
}

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
}

function validateUserPassword(password, user) {
  if (!password) {
    return 'Password is required';
  }

  try {
    const hashedPassword = crypto.pbkdf2Sync(
      password, user.salt, 310000, 32, 'sha256',
    );

    if (user.hashed_password !== hashedPassword.toString('hex')) {
      return 'Incorrect password';
    }
  } catch (error) {
    return 'Unknown error';
  }
}

module.exports = {
  validateEmail,
  validateEmailChange,
  validatePassword,
  validateUserPassword,
  validateUsername,
};
