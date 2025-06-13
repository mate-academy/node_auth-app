const { v4: uuidv4 } = require('uuid');
const { User } = require('../models/user');
const { emailService } = require('./email.service');
const { ApiError } = require('../exeptions/api.error');
const { validateName } = require('../utils/validators');

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

const updateUserName = async (userId, newName) => {
  const nameError = validateName(newName);

  if (nameError) {
    throw ApiError.badRequest('Invalid name', { name: nameError });
  }

  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  user.name = newName;
  await user.save();

  return user;
};

const userService = {
  register,
  normalizeUser,
  findByEmail,
  updateUserName,
};

module.exports = { userService };
