'use strict';

const { v4: uuidv4 } = require('uuid');
const { User } = require('../models/User.model');
const emailService = require('../services/email.service');
const ApiError = require('../exception/api.error');

function normalized({ name, email, id }) {
  return { name, email, id };
}

function findByEmail(email) {
  return User.findOne({
    where: {
      email,
    },
  });
}

async function register(name, email, password) {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exist', {
      email: 'User already exist',
    });
  }

  await User.create({
    name,
    email,
    password,
    activationToken,
  });

  await emailService.sendActivationEmail(email, activationToken);
}

async function activation(activationToken) {
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    throw ApiError.notFound({
      error: 'User not found',
    });
  }

  user.activationToken = null;
  user.save();
}

async function reset(email) {
  const updateToken = uuidv4();

  const existUser = await findByEmail(email);

  if (!existUser) {
    throw ApiError.notFound();
  }

  await User.update(
    { updateToken: updateToken },
    {
      where: {
        email,
      },
    },
  );

  await emailService.sendEmailResetPass(email, updateToken);
}

async function update(updateToken, hashedPass) {
  const user = await User.findOne({ where: { updateToken } });

  if (!user) {
    throw ApiError.notFound({
      error: 'User not found',
    });
  }

  user.password = hashedPass;
  user.updateToken = null;
  await user.save();
}

module.exports = {
  normalized,
  findByEmail,
  register,
  activation,
  reset,
  update,
};
