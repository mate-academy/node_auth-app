'use strict';

const { User } = require('./../models/User.model');

const registerUser = async (name, email, password, activationToken) => {
  const user = await findUser(email);

  if (user) {
    throw new Error('User already exist');
  }

  const registeredUser = await User.create({
    name,
    email,
    password,
    activationToken,
  });

  return registeredUser;
};

const activateUser = (email) => {
  return User.update({ activationToken: null }, { where: { email } });
};

const getAllUsers = () => {
  return User.findAll();
};

const findUser = async (email) => {
  const user = await User.findOne({
    where: { email },
  });

  return user;
};

const findUserById = async (userId) => {
  const user = User.findOne({
    where: { userId },
  });

  return user;
};

const normalizeUser = (user) => {
  return {
    userId: user.userId,
    email: user.email,
    name: user.name,
  };
};

const validateEmail = (email) => {
  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w]{2,}$/;

  if (!email) {
    return 'Email is required';
  }

  if (!emailPattern.test(email)) {
    return 'Email is not valid';
  }
};

const validateName = (name) => {
  if (!name) {
    return 'Name is required';
  }

  if (name.length < 4) {
    return 'Name should be at least 4 symbols';
  }
};

const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }
};

const updateUserName = (id, name) =>
  User.update({ name }, { where: { userId: id } });

const updateUserEmail = (id, email) =>
  User.update({ email }, { where: { userId: id } });

const updateUserPassword = (id, password) =>
  User.update({ password }, { where: { userId: id } });

module.exports = {
  getAllUsers,
  registerUser,
  activateUser,
  findUser,
  findUserById,
  normalizeUser,
  updateUserName,
  updateUserEmail,
  updateUserPassword,
  validateEmail,
  validateName,
  validatePassword,
};
