const { ApiError } = require('../exeptions/api.error');
const { User } = require('../models/User');
const { emailService } = require('../services/email.service.js');
const { v4: uuidv4 } = require('uuid');

function normalize({ id, email }) {
  return { id, email };
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

function findById(id) {
  return User.findByPk(id);
}

async function register(email, password) {
  const activationToken = uuidv4();
  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exist', {
      email: 'User already exists',
    });
  }

  await User.create({ email, password, activationToken });

  await emailService.sendActivationEmail(email, activationToken);
}

async function saveResetToken(userId, token) {
  const user = findById(userId);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  user.resetToken = token;
  await user.save();
}

async function updatePassword(userId, newHashedPassword) {
  const user = findById(userId);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  user.password = newHashedPassword;
  user.resetToken = null;
  await user.save();
}

const userService = {
  normalize,
  findByEmail,
  findById,
  register,
  saveResetToken,
  updatePassword,
};

module.exports = { userService };
