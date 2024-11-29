const { ApiError } = require('../exceptions/ApiError.js');
const { User } = require('../models/User.js');
const { emailService } = require('./email.service.js');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

function getAllActive() {
  return User.findAll({ where: { activationToken: null }, order: ['id'] });
}

function getByEmail(email) {
  return User.findOne({ where: { email } });
}

function normalize({ id, email }) {
  return { id, email };
}

async function register({ email, password }) {
  const existingUser = await getByEmail(email);

  if (existingUser) {
    throw ApiError.BadRequest('Validation error', {
      email: 'Email is already taken',
    });
  }

  const activationToken = uuidv4();
  const hash = await bcrypt.hash(password, 10);

  await User.create({
    email,
    password: hash,
    activationToken,
  });

  await emailService.sendActivationLink(email, activationToken);
}

async function resetEmail(email) {
  const resetToken = uuidv4();
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw ApiError.BadRequest('User not found');
  }

  await emailService.sendReset(email, resetToken);

  user.resetToken = resetToken;
  await user.save();
}

async function changePassword(name, newPassword) {
  const user = await User.findOne({ where: { name } });

  if (!user) {
    throw ApiError.BadRequest('User not found');
  }

  const hash = await bcrypt.hash(newPassword, 10);

  user.password = hash;
  user.resetToken = null;

  await user.save();
}

async function changeName(name, newName) {
  const user = await User.findOne({ where: { name } });
  const existUser = await User.findOne({ where: { name: newName } });

  if (existUser) {
    throw ApiError.BadRequest('Name is already taken');
  }

  if (!user) {
    throw ApiError.BadRequest('User not found');
  }

  user.name = newName;
  await user.save();
}

async function changeEmail(name, newEmail) {
  const resetToken = uuidv4();
  const existEmail = await getByEmail(newEmail);

  if (existEmail) {
    throw ApiError.BadRequest('Email is already taken');
  }

  const user = await User.findOne({ where: { name } });

  if (!user) {
    throw ApiError.BadRequest('User not found');
  }

  await emailService.sendConfirmation(newEmail, resetToken);

  user.resetToken = resetToken;
  await user.save();
}

const userService = {
  getAllActive,
  normalize,
  getByEmail,
  register,
  resetEmail,
  changePassword,
  changeName,
  changeEmail,
};

module.exports = { userService };
