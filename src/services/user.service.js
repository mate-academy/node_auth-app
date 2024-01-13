'use strict';

const { ApiError } = require('../exeptions/api.error.js');
const { User } = require('../models/user.js');
const { v4: uuidv4 } = require('uuid');
const emailService = require('./email.service.js');
const bcrypt = require('bcrypt');

function getAllActivated() {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
};

function normalize({ id, email, name }) {
  return {
    id, email, name,
  };
};

async function findByEmail(email) {
  return User.findOne({
    where: {
      email,
    },
  });
};

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
};

const findActiveUser = async(email) => {
  const user = await User.findOne({
    where: {
      email,
    },
  });

  if (!user) {
    throw ApiError.notFound();
  }

  if (user.activationToken !== null) {
    throw ApiError.unauthorized('Not active. Please check your email!');
  }

  return user;
};

const updateResetToken = (resetToken, user) => {
  user.resetToken = resetToken;

  return user.save();
};

const consumeToken = async(tokenType, user) => {
  user[tokenType] = null;

  await user.save();

  return user;
};

const updatePassword = async(user, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  user.password = hashedPassword;

  return user.save();
};

const updateEmail = async(user, email, activationToken) => {
  user.activationToken = activationToken;
  user.email = email;

  await user.save();
};

const checkPassword = async(password, user) => {
  if (!(await bcrypt.compare(password, user.password))) {
    throw ApiError.badRequest('Wrong password!');
  }
};

module.exports = {
  getAllActivated,
  normalize,
  findByEmail,
  register,
  findActiveUser,
  updateResetToken,
  consumeToken,
  updatePassword,
  checkPassword,
  updateEmail,
};
