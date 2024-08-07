const bcrypt = require('bcrypt');

const { ApiError } = require('../exceptions/api.error');
const { User } = require('../models/User');
const emailService = require('../services/email.service');

function validateEmail(email) {
  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!email) {
    return 'Email is required';
  }

  if (!emailPattern.test(email)) {
    return 'Email is not valid';
  }
}

function validatePassword(password) {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 6) {
    return 'At least 6 characters';
  }
}

function validateName(value) {
  if (value.length < 3) {
    return 'At least 3 characters';
  }
}

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

const findByEmailAndId = (userId, email) => {
  return User.findOne({ where: { id: userId, email } });
};

const findById = (userId) => {
  return User.findOne({ where: { id: userId } });
};

const register = async (name, email, password) => {
  const existingUser = await findByEmail(email);

  if (existingUser) {
    throw ApiError.BadRequest('User already exist', {
      email: 'User already exist',
    });
  }

  const hash = await bcrypt.hash(password, 10);
  const activationToken = bcrypt.genSaltSync(1);

  await User.create({
    name,
    email,
    password: hash,
    activationToken,
  });

  await emailService.sendActivationLink(name, email, activationToken);
};

module.exports = {
  validateName,
  validateEmail,
  validatePassword,
  normalize,
  getAllActive,
  findByEmail,
  findById,
  findByToken,
  findByEmailAndId,
  register,
};
