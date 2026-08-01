const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { User } = require('../models/User.model.js');
const { ApiError } = require('../exeptions/api.error.js');
const { emailService } = require('./email.service.js');

function getAllActivated() {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

function findById(userId) {
  return User.findByPk(userId);
}

async function register({ password, email, name }) {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exists', {
      email: 'This email is already in use',
    });
  }

  await User.create({
    email,
    password,
    name,
    activationToken,
  });

  await emailService.sendActivationEmail(email, activationToken);
}

async function updateName({ userId, newName }) {
  if (!newName) {
    throw ApiError.badRequest('Validation error', {
      name: 'Name is required',
    });
  }

  const user = await findById(userId);

  if (!user) {
    throw ApiError.notFound();
  }

  user.name = newName;
  await user.save();

  return user;
}

async function updatePassword({
  userId,
  oldPassword,
  newPassword,
  confirmation,
}) {
  if (!oldPassword || !newPassword) {
    throw ApiError.badRequest('Validation error', {
      password: 'Password is required',
    });
  }

  if (!confirmation) {
    throw ApiError.badRequest('Validation error', {
      confirmation: 'Confirmation is required',
    });
  }

  if (newPassword.length < 6) {
    throw ApiError.badRequest('Validation error', {
      newPassword: 'At least 6 characters',
    });
  }

  if (newPassword !== confirmation) {
    throw ApiError.badRequest('Passwords do not match');
  }

  const user = await findById(userId);

  if (!user) {
    throw ApiError.notFound();
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return user;
}

async function requestEmailChange({ userId, password, newEmail }) {
  if (!password || !newEmail) {
    throw ApiError.badRequest('Validation error', {
      email: 'Password and new email are required',
    });
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(newEmail)) {
    throw ApiError.badRequest('Validation error', {
      email: 'Email is not valid',
    });
  }

  const user = await findById(userId);

  if (!user) {
    throw ApiError.notFound();
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  const existUser = await findByEmail(newEmail);

  if (existUser) {
    throw ApiError.badRequest('User already exists', {
      email: 'This email is already in use',
    });
  }

  const emailChangeToken = uuidv4();

  user.newEmail = newEmail;
  user.emailChangeToken = emailChangeToken;
  await user.save();

  await emailService.sendEmailChangeConfirmation(newEmail, emailChangeToken);
  await emailService.sendEmailChangeNotification(user.email, newEmail);
}

async function confirmEmailChange({ emailChangeToken }) {
  const user = await User.findOne({ where: { emailChangeToken } });

  if (!user) {
    throw ApiError.notFound();
  }

  user.email = user.newEmail;
  user.newEmail = null;
  user.emailChangeToken = null;
  await user.save();

  return user;
}

function normalize({ id, email, name }) {
  return { id, email, name };
}

const userService = {
  getAllActivated,
  findByEmail,
  register,
  normalize,
  updateName,
  updatePassword,
  requestEmailChange,
  confirmEmailChange,
};

module.exports = { userService };
