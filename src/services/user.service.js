'use strict';

const { ApiError } = require('../exceptions/api.error');
const { User } = require('../models/user');
const uuidv4 = require('uuid').v4;
const bcrypt = require('bcrypt');
const { emailService } = require('../services/email.service');

function findByEmail(email) {
  return User.findOne({
    where: {
      email,
    },
  });
}

async function registration({ name, email, password }) {
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

const userService = {
  registration,
  findByEmail,
};

module.exports = {
  userService,
};
