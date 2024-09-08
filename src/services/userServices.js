'use strict';

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const emailServices = require('../services/emailServices.js');
const { ApiError } = require('../exeption/apiError.js');
const { User } = require('../models/user.js');
const { Token } = require('../models/token.js');
const validate = require('../utils/validate.js');

const getUserById = async(id) => {
  const user = await User.findOne({ where: { id } });

  if (!user) {
    throw ApiError.notFound();
  }

  return user;
};

const normalize = ({ id, name, email }) => {
  return {
    id,
    name,
    email,
  };
};

const findByEmail = (email) => {
  return User.findOne({
    where: {
      email,
    },
  });
};

const register = async(name, email, password) => {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (!existUser) {
    throw ApiError.badRequest('User already exist', {
      email: 'User already exist',
    });
  }

  const hashedPass = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hashedPass,
    activationToken,
  });

  await emailServices.sendActivationEmail(email, activationToken);
};

const resetPassword = async(email) => {
  const user = await findByEmail(email);

  if (!user) {
    throw ApiError.notFound('User not found', {
      email: 'Check your email',
    });
  }

  user.resetToken = uuidv4();
  user.save();

  await emailServices.sendResetPasswordEmail(email, user.resetToken);
};

const getUser = async(userId) => {
  const user = await User.findOne({ where: { userId } });

  if (!user) {
    throw ApiError.notFound();
  };

  const isLogged = await Token.findOne({ where: { userId } });

  if (!isLogged) {
    throw ApiError.unauthorized();
  };

  return normalize(user);
};

const updateEmail = async(id, email, password) => {
  const user = await User.findByPk(id);
  const isPasswordValid = await bcrypt.compare(password, user.password)
    ? null
    : 'Invalid password';
  const isNewEmail = email === user.email ? 'Same email' : null;

  const errors = {
    email: validate.email(email) || isNewEmail,
    password: isPasswordValid,
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest('Something went wrong', errors);
  };

  const activationToken = uuidv4();

  user.activationToken = activationToken;
  user.newEmail = email;
  user.save();

  await emailServices.sendNewEmailActivation(email, activationToken, id);
};

const updateName = async(id, name) => {
  const user = await getUserById(id);

  const isValidName = validate.username(name);

  if (!isValidName || name === user.name) {
    throw ApiError.badRequest('Invalid name');
  };

  user.name = name;
  user.save();
};

const updatePassword = async(
  id,
  password,
  newPassword,
  confirmation
) => {
  const user = await User.findByPk(id);
  const isPasswordValid = await bcrypt.compare(password, user.password)
    ? null
    : 'Invalid password';

  const isNewPasswordValid = await validate.newPassword(
    password,
    newPassword,
    confirmation,
  );

  const errors = {
    password: isPasswordValid,
    newPassword: isNewPasswordValid,
  };

  if (errors.password || errors.newPassword) {
    throw ApiError.badRequest('Change password error', errors);
  }

  const hashedNewPas = await bcrypt.hash(newPassword, 10);

  user.password = hashedNewPas;
  user.save();
};

module.exports = {
  getUserById,
  normalize,
  findByEmail,
  register,
  resetPassword,
  getUser,
  updateEmail,
  updateName,
  updatePassword,
};
