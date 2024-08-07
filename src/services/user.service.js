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

function hashPassword(password, saltRounds = 10) {
  return bcrypt.hash(password, saltRounds);
}

const comparePasswords = (userPasswordHash, incomingPassword) => {
  return bcrypt.compare(incomingPassword, userPasswordHash);
};

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

const register = async (name, email, password) => {
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
};

const updateEmail = async (newEmail, userId) => {
  const user = await findById(userId);

  if (!user) {
    throw ApiError.Unauthorized();
  }

  await user.update('email', newEmail);
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
  register,
  updatePassword,
  comparePasswords,
  updateName,
  updateEmail,
};
