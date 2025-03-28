/* eslint-disable no-console */
const { ApiError } = require('../exeptions/api.errors');
const { User } = require('../models/user');
const { EmailServices } = require('../services/email.service');
const { v4: uuidv4 } = require('uuid');

function getAllActivated() {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
}

function normalize({ id, name, email }) {
  return { id, name, email };
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

async function register(name, email, password) {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exist', {
      email: 'User.already exist',
    });
  }

  await User.create({
    name,
    email,
    password,
    activationToken,
  });

  await EmailServices.sendActivationEmail(email, activationToken);
}

const UsersServices = {
  getAllActivated,
  normalize,
  findByEmail,
  register,
};

module.exports = {
  UsersServices,
};
