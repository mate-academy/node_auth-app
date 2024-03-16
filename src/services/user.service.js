'use strict';

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { User } = require('../models/User');
const mailService = require('./mail.service');
const tokenService = require('./token.service');
const accountService = require('./account.service');
const { ApiError } = require('../exceptions/ApiError');

const normalize = async({ id, username, email, authType }) => {
  const accounts = await accountService.getAllByUser(id);

  const normalizedUser = {
    id, username, email, authType,
  };

  if (accounts) {
    accounts.forEach(account => {
      normalizedUser[account.type] = {
        id: account.id,
        name: account.name,
      };
    });
  }

  return normalizedUser;
};

const getByEmail = (email) => {
  return User.findOne({
    where: { email },
  });
};

const getById = (id) => {
  return User.findByPk(id);
};

const register = async({ username, email, password }) => {
  const isExistingUser = await getByEmail(email);

  if (isExistingUser) {
    throw ApiError.BadRequest('User already exists');
  }

  const hashedPassword = await bcrypt.hash(
    password, Number(process.env.BCRYPT_SALT)
  );
  const activationToken = crypto.randomBytes(32).toString('hex');

  const newUser = await User.create({
    username, email, password: hashedPassword,
  });

  await tokenService.save({
    userId: newUser.id,
    token: activationToken,
    type: 'activationToken',
  });

  await mailService.sendActivationEmail({
    userId: newUser.id, email, activationToken,
  });
};

const activate = async({ token, id }) => {
  const user = await getById(id);

  if (!user) {
    throw ApiError.NotFound('User not found');
  }

  const userActivationToken = await tokenService.get({
    userId: id,
    type: 'activationToken',
  });

  if (!userActivationToken) {
    throw ApiError.BadRequest('Invalid credentials');
  }

  const isTokenValid = await bcrypt.compare(token, userActivationToken);

  if (!isTokenValid) {
    throw ApiError.BadRequest('Invalid credentials');
  }

  await tokenService.remove({
    userId: id,
    type: 'activationToken',
  });
};

const login = async({ email, password }) => {
  const user = await getByEmail(email);

  if (!user) {
    throw ApiError.NotFound('User not found');
  }

  const isPassValid = await bcrypt.compare(password, user.password);

  if (!isPassValid) {
    throw ApiError.BadRequest('Invalid credentials');
  }
};

const requestForReset = async(email) => {
  const user = await getByEmail(email);

  if (!user) {
    throw ApiError.NotFound('User not found');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');

  await tokenService.save({
    userId: user.id,
    token: resetToken,
    type: 'resetToken',
  });

  await mailService.sendResetEmail({
    userId: user.id, email, resetToken,
  });
};

const confirmForReset = async({ token, id }) => {
  const user = await getById(id);

  if (!user) {
    throw ApiError.NotFound('User not found');
  }

  const userResetToken = await tokenService.get({
    userId: id,
    type: 'resetToken',
  });

  if (!userResetToken) {
    throw ApiError.BadRequest('Invalid credentials');
  }

  const isTokenValid = await bcrypt.compare(token, userResetToken);

  if (!isTokenValid) {
    throw ApiError.BadRequest('Invalid credentials');
  }

  await tokenService.remove({
    userId: id,
    type: 'resetToken',
  });
};

const resetPassword = async({ email, newPassword }) => {
  const user = await getByEmail(email);

  if (!user) {
    throw ApiError.NotFound('User not found');
  }

  const hashedPassword = await bcrypt.hash(
    newPassword, Number(process.env.BCRYPT_SALT)
  );

  user.password = hashedPassword;
  await user.save();
};

const changePassword = async({ userId, oldPassword, newPassword }) => {
  const user = await getById(userId);

  if (!user) {
    throw ApiError.NotFound('User not found');
  }

  const isPassValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPassValid) {
    throw ApiError.BadRequest('Invalid credentials');
  }

  const hashedPassword = await bcrypt.hash(
    newPassword, Number(process.env.BCRYPT_SALT)
  );

  user.password = hashedPassword;
  await user.save();

  await mailService.sendPasswordChangedEmail({ email: user.email });
};

const changeUsername = async(userId, newUsername) => {
  const user = await getById(userId);

  if (!user) {
    throw ApiError.NotFound('User not found');
  }

  user.username = newUsername;
  await user.save();
};

const requestEmailChange = async(password, oldEmail, newEmail) => {
  const user = await getByEmail(oldEmail);

  if (!user) {
    throw ApiError.NotFound('User not found');
  }

  if (password !== null) {
    const isPassValid = await bcrypt.compare(password, user.password);

    if (!isPassValid) {
      throw ApiError.BadRequest('Invalid credentials');
    }
  }

  const newEmailToken = crypto.randomBytes(32).toString('hex');

  await tokenService.save({
    userId: user.id,
    token: newEmailToken,
    type: 'newEmailToken',
  });

  await mailService.sendNewEmailConfirmation({
    userId: user.id, email: newEmail, newEmailToken,
  });
};

const confirmEmailChange = async({ token, id }) => {
  const user = await getById(id);

  if (!user) {
    throw ApiError.NotFound('User not found');
  }

  const userNewEmailToken = await tokenService.get({
    userId: id,
    type: 'newEmailToken',
  });

  if (!userNewEmailToken) {
    throw ApiError.BadRequest('Invalid credentials');
  }

  const isTokenValid = await bcrypt.compare(token, userNewEmailToken);

  if (!isTokenValid) {
    throw ApiError.BadRequest('Invalid credentials');
  }

  await tokenService.remove({
    userId: id,
    type: 'newEmailToken',
  });
};

const changeEmail = async({ userId, newEmail }) => {
  const user = await getById(userId);

  if (!user) {
    throw ApiError.NotFound('User not found');
  }

  const oldEmail = user.email;

  user.email = newEmail;
  await user.save();

  await mailService.sendEmailChangedEmail({ oldEmail });
};

const deleteUser = async(userId) => {
  await User.destroy({
    where: { id: userId },
  });
};

module.exports = {
  normalize,
  getByEmail,
  getById,
  register,
  activate,
  login,
  requestForReset,
  confirmForReset,
  resetPassword,
  changePassword,
  changeUsername,
  requestEmailChange,
  confirmEmailChange,
  changeEmail,
  deleteUser,
};
