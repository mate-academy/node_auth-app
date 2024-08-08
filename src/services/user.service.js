const bcrypt = require('bcrypt');

const { ApiError } = require('../exceptions/api.error');
const { User } = require('../models/User');
const emailService = require('../services/email.service');
const { hashPassword } = require('../utils');

const normalize = ({ id, name, email }) => {
  return { id, name, email };
};

const getAllActive = () => {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
};

const findByEmail = (email) => {
  return User.findOne({ where: { email } });
};

const findByToken = (activationToken) => {
  return User.findOne({ where: { activationToken } });
};

const findById = (userId) => {
  return User.findOne({ where: { id: userId } });
};

const create = async (name, email, password) => {
  const existingUser = await findByEmail(email);

  if (existingUser) {
    throw ApiError.BadRequest('User already exist', {
      email: 'User already exist',
    });
  }

  const hash = await hashPassword(password);
  const activationToken = bcrypt.genSaltSync(1);

  await User.create({
    name,
    email,
    password: hash,
    activationToken,
  });

  await emailService.sendActivationLink(name, email, activationToken);
};

const updatePassword = async (userId, newPassword) => {
  const user = await User.findByPk(userId);

  const hashedPassword = await hashPassword(newPassword);

  user.password = hashedPassword;
  await user.save();
};

const updateName = async (newName, userId) => {
  const user = await findById(userId);

  if (!user) {
    throw ApiError.Unauthorized();
  }

  await user.update('name', newName);

  return user;
};

const updateEmail = async (newEmail, userId) => {
  const user = await findById(userId);

  if (!user) {
    throw ApiError.Unauthorized();
  }

  await user.update('email', newEmail);

  return user;
};

module.exports = {
  normalize,
  getAllActive,
  findByEmail,
  findById,
  findByToken,
  create,
  updateName,
  updateEmail,
  updatePassword,
};
