const ApiError = require('../exeptions/api.error.js');
const { User } = require('../models/user.js');
const { v4, uuidv4 } = require('uuid');
const emailService = require('../services/email.service');

function getAllActivated() {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
}

function normalize({ id, email }) {
  return { id, email };
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

async function register(name, email, password) {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exist', {
      email: 'User already exist',
    });
  }

  await User.create({
    name,
    email,
    password,
    activationToken,
  });
  await emailService.sendActivationEmail(email, activationToken);
}

module.exports = {
  getAllActivated,
  normalize,
  findByEmail,
  register,
};
