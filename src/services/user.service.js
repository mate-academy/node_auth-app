const { ApiError } = require('../exeptions/api.error.js');
const { User } = require('../models/user.js');
const { emailService } = require('../services/email.service.js');
const { v4: uuidv4 } = require('uuid');

function validateName(name) {
  if (!name) {
    return 'Name is required';
  }

  if (name.length < 2) {
    return 'Name is sort';
  }
}

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

function normalize({ id, name, email }) {
  return { id, name, email };
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

async function register(name, email, password) {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.notFound();
  }

  const user = await User.create({
    name,
    email,
    password,
    activationToken,
  });

  await emailService.sendActivationEmail(email, activationToken);

  return user;
}

module.exports = {
  validateName,
  validateEmail,
  validatePassword,
  normalize,
  findByEmail,
  register,
};
