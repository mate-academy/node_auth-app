const { ApiError } = require('../exceptions/api.error.js');
const { User } = require('../models/user.js');
const { emailService } = require('../services/email.service.js');
const { v4: uuidv4 } = require('uuid');

function normalize({ id, email, name }) {
  return { id, email, name };
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

async function registrate(name, email, password) {
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

exports.userService = {
  normalize,
  findByEmail,
  registrate,
};
