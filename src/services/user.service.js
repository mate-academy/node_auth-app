'use strict';

const bcrypt = require('bcrypt');

const { ApiError } = require('../utils/api.error.js');
const { User } = require('../models/user.js');

const create = async (newUser) => {
  const existingUser = await User.findOne({ where: { email: newUser.email } });

  if (existingUser !== null) {
    throw ApiError.BadRequest('User with that email already exist', {
      email: 'Email already used',
    });
  }

  const hashedPassword = await bcrypt.hash(newUser.password, 10);

  const user = await User.create({
    ...newUser,
    password: hashedPassword,
  });

  return user;
};

const checkPassword = async (password, user) => {
  if (!(await bcrypt.compare(password, user.password))) {
    throw ApiError.BadRequest("Email and password don't match!");
  }
};

const findActiveUser = async (email) => {
  const user = await User.findOne({
    where: {
      email,
    },
  });

  if (!user) {
    throw ApiError.NotFound();
  }

  if (user.activationToken !== null) {
    throw ApiError.Unauthorized('Not active. Please check your email!');
  }

  return user;
};

const findByToken = (activationToken) => {
  return User.findOne({ where: { activationToken } });
};

const activateUser = async (user) => {
  user.activationToken = null;

  await user.save();

  return user;
};

exports.userService = {
  create,
  findByToken,
  activateUser,
  findActiveUser,
  checkPassword,
};
