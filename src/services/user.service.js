'use strict';

const { ApiError } = require('../utils/api.error.js');
const { User } = require('../models/user.js');

const create = async (newUser) => {
  const existingUser = await User.findOne({ where: { email: newUser.email } });

  if (existingUser !== null) {
    throw ApiError.BadRequest('User with that email already exist', {
      email: 'Email already used',
    });
  }

  const user = await User.create(newUser);

  return {
    id: user.id,
    email: user.email,
  };
};

exports.userService = {
  create,
};
