const bcrypt = require('bcrypt');
const { ApiError } = require('../exceptions/API-error.js');
const { User } = require('../models/user.model.js');
const { generateActivationToken } = require('./users-service.js');

const createUser = async (name, email, password) => {
  const existingUser = await User.findOne({
    where: {
      email,
    },
  });

  if (existingUser !== null) {
    throw ApiError.BadRequest('This email address is used by another user');
  }

  const activationToken = generateActivationToken();

  const hashedPassword = await hashPassword(password);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    activationToken,
  });

  const newUserPublicData = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    activationToken: newUser.activationToken,
  };

  return newUserPublicData;
};

const findUserByActivationToken = async (activationToken) => {
  return User.findOne({
    where: {
      activationToken,
    },
    attributes: ['id', 'name', 'email'],
  });
};

const findUserByEmail = async (email) => {
  return User.findOne({
    where: {
      email,
    },
    attributes: ['id', 'email'],
  });
};

const consumeActivationToken = async (user) => {
  user.activationToken = null;
  await user.save();
};

const findActivatedUserByEmail = (email) => {
  return User.findOne({
    where: {
      email,
      activationToken: null,
    },
  });
};

const findActivatedUserById = (userId) => {
  return User.findOne({
    where: {
      id: userId,
      activationToken: null,
    },
  });
};

function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, 10);
}

const updatePassword = async (userId, newPassword) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.NotFound();
  }

  const hashedPassword = await hashPassword(newPassword);

  user.password = hashedPassword;
  await user.save();
};

module.exports = {
  createUser,
  findUserByActivationToken,
  findUserByEmail,
  consumeActivationToken,
  findActivatedUserByEmail,
  findActivatedUserById,
  updatePassword,
};
