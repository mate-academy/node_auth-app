const { User } = require('../models/user.js');
const { v4: uuidv4 } = require('uuid');
const { emailService } = require('./email.service.js');
const { ApiError } = require('../exceptions/api.error.js');
const getAllActivated = async () => {
  return User.findAll({ where: { activationToken: null } });
};

const normalize = ({ id, email }) => {
  return { id, email };
};

const findByEmail = async (email) => {
  return User.findOne({ where: { email } });
};

const register = async ({ name, email, password }) => {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('user already exists', {
      email: 'user already exists',
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

module.exports = {
  userService: {
    getAllActivated,
    normalize,
    findByEmail,
    register,
  },
};
