'use strict';

const { User } = require('../models/User');

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

function findById(id) {
  return User.findOne({ where: { id } });
}

function create(name, email, password, activationToken) {
  return User.create({
    name,
    email,
    password,
    activationToken,
  });
}

function normalize({ id, name, email }) {
  return { id, name, email };
}

function validatePassword(password) {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 6) {
    return 'At least 6 characters';
  }
}

function validateEmail(email) {
  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!email) {
    return 'Email is required';
  }

  if (!emailPattern.test(email)) {
    return 'Email is not valid';
  }
}

function findByEmailChangeToken(token) {
  return User.findOne({ where: { emailChangeToken: token } });
}

module.exports = {
  findByEmail,
  findById,
  create,
  normalize,
  validatePassword,
  validateEmail,
  findByEmailChangeToken,
};
