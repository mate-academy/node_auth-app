'use strict';

const { randomUUID } = require('crypto');
const bcrypt = require('bcrypt');
const { ApiError } = require('../exceptions/ApiError');
const { User } = require('../models/user.model');
const emailService = require('./email.service');

function getByEmail(email) {
  return User.findOne({
    where: { email },
  });
}

function getById(id) {
  return User.findByPk(id);
}

function normalize({ id, name, email }) {
  return {
    id, name, email,
  };
}

async function register({ name, email, password }) {
  const existingUser = await getByEmail(email);

  if (existingUser) {
    throw ApiError.BadRequest('Validation error', {
      email: 'Email is already taken',
    });
  }

  const activationToken = randomUUID();
  const hash = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hash,
    activationToken,
  });

  await emailService.sendActivationLink(email, activationToken);
}

async function edit({ id, name }) {
  await User.update(
    { name },
    { where: { id } },
  );
}

module.exports = {
  getByEmail,
  register,
  normalize,
  edit,
  getById,
};
