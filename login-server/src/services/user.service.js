'use strict';

const { User } = require('../models/user.js');
const { sendActivationEmail } = require('./email.service');
const { v4: uuidv4 } = require('uuid');
const { ApiError } = require('../exeptions/api.error');

async function getAllActivated() {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
}

function normalize({ id, email }) {
  return {
    id, email,
  };
}

function findByEmail(email) {
  return User.findOne({
    where: { email },
  });
}

async function registerUser(email, password) {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exists', {
      email: 'User already exists',
    });
  }

  await User.create({
    email, password, activationToken,
  });

  await sendActivationEmail(email, activationToken);
};

module.exports = {
  getAllActivated,
  normalize,
  findByEmail,
  registerUser,
};
