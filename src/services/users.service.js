const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const { User } = require('../models');
const emailService = require('./email.service.js');
const { ApiError } = require('../exceptions');

const normalize = ({ id, name, email }) => ({
  id,
  name,
  email,
});

const getAllActive = async () => {
  return User.findAll({ where: { activationToken: null }, order: ['id'] });
};

const getByEmail = (email) => {
  return User.findOne({ where: { email } });
};

const register = async ({ name, email, password }) => {
  const existingUser = await getByEmail(email);

  if (existingUser) {
    throw ApiError.badRequest('Validation error', {
      email: 'Email is already taken',
    });
  }

  const activationToken = uuidv4();
  const hash = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hash,
    activationToken,
  });

  await emailService.sendActivationEmail(email, activationToken);
};

module.exports = {
  normalize,
  getAllActive,
  getByEmail,
  register,
};
