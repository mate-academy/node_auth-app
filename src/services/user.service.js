'use strict';

const bcrypt = require('bcrypt');

const { ApiError } = require('../utils/api.error.js');
const { User } = require('../models/user.js');

const hashPassword = (password) => {
  return bcrypt.hash(password, 10);
};

const create = async (newUser) => {
  const existingUser = await User.findOne({ where: { email: newUser.email } });

  if (existingUser !== null) {
    throw ApiError.BadRequest('User with that email already exist', {
      email: 'Email already used',
    });
  }

  const hashedPassword = await hashPassword(newUser.password);

  const user = await User.create({
    ...newUser,
    password: hashedPassword,
  });

  return user;
};

const checkPassword = async (password, user) => {
  if (!(await bcrypt.compare(password, user.password))) {
    throw ApiError.BadRequest('Wrong password!');
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

const findByToken = (tokenType, token) => {
  return User.findOne({ where: { [tokenType]: token } });
};

const updatePassword = async (user, password) => {
  const hashedPassword = await hashPassword(password);

  user.password = hashedPassword;

  return user.save();
};

const updateName = async (user, name) => {
  user.name = name;

  await user.save();

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
};

const updateEmail = async (user, email, activationToken) => {
  user.activationToken = activationToken;
  user.email = email;

  await user.save();
};

const updateResetToken = (resetToken, user) => {
  user.resetToken = resetToken;

  return user.save();
};

const consumeToken = async (tokenType, user) => {
  user[tokenType] = null;

  await user.save();

  return user;
};

exports.userService = {
  create,
  findByToken,
  consumeToken,
  findActiveUser,
  checkPassword,
  updateResetToken,
  updatePassword,
  updateName,
  updateEmail,
};
