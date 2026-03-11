const { ApiError } = require('../exeptions/api.error');
const { User } = require('../models/user.model');
const { emailService } = require('../services/email.service');
const { v4: uuidv4 } = require('uuid');

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

async function resetPassword(email) {
  const resetToken = uuidv4();

  const user = await findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('User does not exist');
  }

  user.resetToken = resetToken;
  await user.save();

  await emailService.sendActivationEmail(email, resetToken);
}

const userService = {
  getAllActivated,
  normalize,
  findByEmail,
  register,
  resetPassword,
};

module.exports = { userService };
