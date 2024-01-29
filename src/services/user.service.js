"use strict";

const { User } = require("../models/User");
const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');
const { sendActivationEmail, sendNewEmail } = require("./email.service");
const { validatePassword, validateEmail } = require("../utils/validationFunction");


function getAllUserActivated() {
  return User.findAll({
    where: {
      activationToken: null,
    }
  })
}

function normalize({ id, email }) {
  return { id, email }
}

function findByEmail(email) {
  return User.findOne({where: { email }});

}

async function register({ name, email, password }) {
  const existingUser = await findByEmail(email);

  if (existingUser) {
    throw ApiError.BadRequest('Validation error', {
      email: 'Email is already taken',
    });
  }

  const activationToken = randomUUID();
  const hash = await bcryp.hash(password, 10);

  await User.create({
    name,
    email,
    password: hash,
    activationToken,
  });

  await sendActivationEmail(email, activationToken);
}

async function changePassword(req, res) {
  const { newPassword, oldPassword } = req.body;
  const { email } = req.user;
  const user = await userService.findByEmail(email);

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

  const user = await userService.findOne(id);

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

  res.send(userService.normalize(user));
}

module.exports = {
  getAllUserActivated,
  normalize,
  findByEmail,
  register,
  changeEmail,
  changePassword,
}
