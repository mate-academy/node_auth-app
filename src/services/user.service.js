const { ApiError } = require('../exceptions/api.error.js');
const { User } = require('../models/user.model.js');
const { v4: uuidv4 } = require('uuid');
const { emailService } = require('./email.service.js');

const normalize = ({ id, name, email }) => {
  return { id, name, email };
};

const createUser = async ({ name, email, password }) => {
  const existUser = await getUserByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exists', {
      email: 'This email is already being used',
    });
  }

  const activationToken = uuidv4();

  await User.create({
    name,
    email,
    password,
    activationToken,
  });

  await emailService.sendActivationEmail({ email, activationToken });
};

const getUserByActivationToken = (activationToken) => {
  return User.findOne({ where: { activationToken } });
};

const getUserByEmail = (email) => {
  return User.findOne({ where: { email } });
};

const getAllActivated = () => {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
};

const getUserById = (id) => {
  return User.findOne({ where: { id } });
};

const userService = {
  normalize,
  createUser,
  getUserByActivationToken,
  getUserByEmail,
  getAllActivated,
  getUserById,
};

module.exports = { userService };
