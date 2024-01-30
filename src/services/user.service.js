"use strict";

const { User } = require('../models/User');
const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');
const { sendActivationEmail, sendNewEmail } = require('./email.service');
const { validatePassword, validateEmail }
  = require('../utils/validationFunction');
const { ApiError } = require('../exeptions/api.error');


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
  return User.findOne({
    where: { email },
  });
}

const getById = async(id) => {
  return User.findByPk(id);
};

async function register({ name, email, password }) {
  const existingUser = await findByEmail(email);

  if (existingUser) {
    throw ApiError.BadRequest('Validation error', {
      email: 'Email is already taken',
    });
  }

  const activationToken = randomUUID();
  const hash = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hash,
    activationToken,
  });

  await sendActivationEmail(email, activationToken);
}

module.exports = {
  getAllUserActivated,
  normalize,
  findByEmail,
  register,
  getById,
}
