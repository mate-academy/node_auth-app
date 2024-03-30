const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const { emailService } = require('../services/emailService.js');
const { ApiError } = require('../exceptions/ApiError.js');
const { User } = require('../models/User.js');
const { bcryptService } = require('./bcryptService.js');
const { validate } = require('../utils/validate.js');

function getAllActive() {
  return User.findAll({
    where: { activationToken: null },
    order: ['id'],
  });
}

function getByEmail(email) {
  return User.findOne({
    where: { email },
  });
}

function normalize({ id, name, email }) {
  return { id, name, email };
}

async function register({ name, email, password }) {
  const existingUser = await getByEmail(email);

  if (existingUser) {
    throw ApiError.BadRequest('Validation error', {
      email: 'Email is already taken',
    });
  }

  const activationToken = uuidv4();
  const hash = await bcryptService.createHash(password);

  const options = {
    route: 'activation',
    subject: 'Acivate your account',
    title: 'Activation link',
  };

  await User.create({
    name,
    email,
    password: hash,
    activationToken,
  });

  await emailService.sendActivationLink(email, activationToken, options);
}

async function changeName(email, name) {
  const user = await getByEmail(email);

  if (!user) {
    throw ApiError.NotFound('user');
  }

  user.name = name;

  await user.save();
}

async function changePassword(email, oldPass, newPass, confirmation) {
  const user = await getByEmail(email);

  if (!user) {
    throw ApiError.NotFound('user');
  }

  const isValid = await bcryptService.compare(oldPass, user.password);

  const errors = {
    oldPass: isValid,
    password: validate.password(newPass),
    isNotEqual: newPass !== confirmation ? 'Passwords are not equal' : null,
  };

  if (errors.password || errors.isNotEqual || errors.oldPass) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  user.password = await bcryptService.createHash(newPass);

  await user.save();
}

async function forgotPassword(user) {
  const activationToken = uuidv4();
  const options = {
    route: 'user/reset-password',
    subject: 'Reset password',
    title: 'Reset password',
  };

  user.activationToken = activationToken;
  await user.save();
  await emailService.sendActivationLink(user.email, activationToken, options);
}

async function resetPassword(activationToken, password) {
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    throw ApiError.NotFound('user');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  user.activationToken = null;
  user.password = hashedPassword;
  await user.save();
}

async function changeEmailRequest(oldEmail, password, newEmail) {
  const user = await getByEmail(oldEmail);

  if (!user) {
    throw ApiError.Unauthorized();
  }

  const isValid = await bcryptService.compare(password, user.password);

  const errors = {
    password: isValid,
  };

  if (errors.password) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  const activationToken = uuidv4();

  user.activationToken = activationToken;
  await user.save();

  const options = {
    route: 'user/change-email',
    subject: 'Email change',
    title: 'Proceed to change email',
  };

  await emailService.sendActivationLink(newEmail, activationToken, options);
}

async function changeEmail(activationToken, newEmail) {
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    throw ApiError.NotFound('user');
  }

  const errors = {
    email: validate.email(newEmail),
  };

  if (errors.email) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  const oldEmail = user.email;

  user.email = newEmail;
  user.activationToken = null;
  await user.save();

  const options = {
    subject: 'Email change notification',
    title: 'Email change notification',
  };

  await emailService.sendNotification(oldEmail, newEmail, options);
}

module.exports = {
  userService: {
    getAllActive,
    normalize,
    getByEmail,
    register,
    changeName,
    forgotPassword,
    resetPassword,
    changePassword,
    changeEmailRequest,
    changeEmail,
  },
};

uuidv4();
