'use strict';

const { ApiError } = require('../exeptions/api.error');
const { getAllUserActivated, normalize, getById, findByEmail }
  = require('../services/user.service');
const { validatePassword, validateEmail } = require('../utils/validationFunction');
const bcrypt = require('bcrypt');
const { sendNewEmail } = require('../services/email.service');

const getAllActivated = async (req, res) => {
  const users = await getAllUserActivated();

  res.send(users.map(normalize));
}

async function changePassword(req, res) {
  const { newPassword, oldPassword } = req.body;
  const { email } = req.user;
  const user = await findByEmail(email);

  const errors = {
    newPassword: validatePassword(newPassword),
    oldPassword: validatePassword(oldPassword),
  };

  if (errors.newPassword || errors.oldPassword) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Password is wrong');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.sendStatus(204);
}

async function changeEmail(req, res) {
  const { password, newEmail } = req.body;
  const { id } = req.user;

  const user = await getById(id);

  const oldEmail = user.email;

  const errors = {
    password: validatePassword(password),
    newEmail: validateEmail(newEmail),
  };

  if (oldEmail === newEmail) {
    throw ApiError.BadRequest('New email must be different from old email');
  }

  if (errors.password || errors.newEmail) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Password is wrong');
  }

  user.email = newEmail;
  await user.save();

  await sendNewEmail(oldEmail, newEmail);
  await sendNewEmail(newEmail, newEmail);

  res.send(normalize(user));
}

module.exports = {
  getAllActivated,
  changeEmail,
  changePassword,
};
