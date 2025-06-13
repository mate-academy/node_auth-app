const { v4: uuidv4 } = require('uuid');
const { User } = require('../models/user');
const { emailService } = require('./email.service');
const { ApiError } = require('../exeptions/api.error');

const normalizeUser = (user) => {
  const { id, name, email, createdAt, updatedAt } = user;

  return {
    id,
    name,
    email,
    createdAt,
    updatedAt,
  };
};

const findByEmail = (email) => {
  return User.findOne({
    where: { email },
  });
};

const register = async (name, email, password) => {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exists', {
      email: 'User already exists',
    });
  }

  await User.create({
    name,
    email,
    password,
    activationToken,
  });

  await emailService.sendActivationEmail(email, activationToken);
};

const userService = {
  register,
  normalizeUser,
  findByEmail,
};

module.exports = { userService };
