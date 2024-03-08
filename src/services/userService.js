'use strict';

const { v4: uuidv4 } = require('uuid');
const { User } = require('../models/User.js');
const { ErrorApi } = require('../exceptions/ErrorApi.js');
const { mail } = require('../utils/mail.js');
const { bcryptService } = require('./bcryptService.js');
const { ACTIVATION_PASSWORD_WAY } = require('../defaultConfig.js');

function normalize({ id, email, name, googleId }) {
  return {
    id, email, name, googleId,
  };
}

function getById(id) {
  return User.findByPk(id);
}

function getByEmail(email) {
  return User.findOne({
    where: { email },
  });
}

function getByActivationToken(activationToken) {
  return User.findOne({
    where: { activationToken },
  });
}

function getByGoogleId(googleId) {
  return User.findOne({
    where: { googleId },
  });
}

async function register({ name, email, password }) {
  if (await getByEmail(email)) {
    throw ErrorApi.BadRequest('Validation error', {
      email: 'Email is already taken',
    });
  }

  const activationToken = uuidv4();
  const hash = await bcryptService.getHash(password);

  await User.create({
    name,
    email,
    password: hash,
    activationToken,
  });

  await mail.sendActivationLink(email, activationToken);
}

async function forgot(email) {
  const activationToken = uuidv4();
  const mailOptions = {
    way: ACTIVATION_PASSWORD_WAY,
    subject: 'Password reset',
    htmlTitle: 'Password reset for your account',
  };

  await User.update({ activationToken }, { where: { email } });

  await mail.sendActivationLink(email, activationToken, mailOptions);
}

async function resetPassword(activetionToken, password) {
  const foundUser = await getByActivationToken(activetionToken);

  if (!foundUser) {
    throw ErrorApi.NotFound('user');
  }

  const hash = await bcryptService.getHash(password);

  foundUser.activationToken = null;
  foundUser.password = hash;
  await foundUser.save();
}

async function changeName(userId, newName) {
  const foundUser = await getById(userId);

  if (!foundUser) {
    throw ErrorApi.NotFound('user');
  }

  foundUser.name = newName;

  await foundUser.save();
}

async function changePassword(userId, oldPasword, newPassword) {
  const foundUser = await getById(userId);

  if (!foundUser) {
    throw ErrorApi.NotFound('user');
  }

  if (!(await bcryptService.isEquel(oldPasword, foundUser.password))) {
    throw ErrorApi.BadRequest('Password is wrong');
  }

  const hash = await bcryptService.getHash(newPassword);

  foundUser.password = hash;
  await foundUser.save();
}

async function changeEmailRequest(id, email) {
  const foundUser = await getById(id);

  if (!foundUser) {
    throw ErrorApi.NotFound('user');
  }

  const activationToken = uuidv4();

  foundUser.activationToken = activationToken;
  await foundUser.save();

  const mailOptions = {
    subject: 'Confirm the email change',
    htmlTitle: 'Confirm the action',
  };

  await mail.sendActivationKey(email, activationToken, mailOptions);
}

async function changeEmail(activetionToken, newEmail) {
  const foundUser = await getByActivationToken(activetionToken);

  if (!foundUser) {
    throw ErrorApi.NotFound('user');
  }

  const oldEmail = foundUser.email;

  foundUser.activationToken = null;
  foundUser.email = newEmail;

  await foundUser.save();

  await mail.sendChangeEmailNotification(oldEmail, newEmail);
}

module.exports = {
  userService: {
    normalize,
    getById,
    getByEmail,
    getByActivationToken,
    getByGoogleId,
    register,
    forgot,
    resetPassword,
    changeName,
    changePassword,
    changeEmailRequest,
    changeEmail,
  },
};
