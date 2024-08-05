const { User } = require('../models/user.js');
const { ApiErrors } = require('../exeptions/api.error.js');
const { v4: uuidv4 } = require('uuid');
const {
  sendAcivationEmail,
  sendConfirmEmail,
  sendNewPassword,
} = require('../services/email.service.js');

async function getAllActivatedUsers() {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
}

function normalize({ name, id, email }) {
  return { name, id, email };
}

function findByEmail(email) {
  return User.findOne({
    where: {
      email,
    },
  });
}

async function registerUser(name, email, password) {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiErrors.badRequest('User already exist', {
      email: 'User already exist',
    });
  }

  await User.create({
    name,
    email,
    password,
    activationToken,
  });

  await sendAcivationEmail(email, activationToken);
}

async function activateNewEmail(email, newEmail) {
  const resetToken = uuidv4();

  const existUser = await findByEmail(email);
  const isEmail = await findByEmail(newEmail);

  if (!existUser) {
    throw ApiErrors.badRequest('User not found. Enter correct email');
  }

  if (isEmail) {
    throw ApiErrors.badRequest('Email is already in use');
  }

  existUser.resetToken = resetToken;
  existUser.save();

  await sendConfirmEmail(newEmail, resetToken);
}

async function addTokenForPassword(email) {
  const resetToken = uuidv4();

  const existUser = await findByEmail(email);

  if (!existUser) {
    throw ApiErrors.badRequest('Email not found');
  }

  existUser.resetToken = resetToken;
  existUser.save();

  await sendNewPassword(email, resetToken);
}

module.exports = {
  getAllActivatedUsers,
  normalize,
  findByEmail,
  registerUser,
  activateNewEmail,
  addTokenForPassword,
};
