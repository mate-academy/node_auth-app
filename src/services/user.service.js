const { ApiError } = require('../exeptions/api.error.js');
const { User } = require('../models/user.model.js');
const { v4: uuidv4 } = require('uuid');
const { emailService } = require('./email.service.js');

function getAllActivated() {
  return User.findAll({
    where: { activationToken: null },
  });
}

function normalize({ id, name, email }) {
  return { id, name, email };
}

function findByEmail(email) {
  return User.findOne({
    where: { email },
  });
}

async function register(email, name, password) {
  const activationToken = uuidv4();

  const existingUser = await findByEmail(email);

  if (existingUser) {
    throw ApiError.badRequest('User already exists', {
      email: 'User with this email already exists',
    });
  }

  await User.create({
    name,
    email,
    password,
    activationToken,
  });

  await emailService.sendActivationEmail({ name, email, activationToken });
}

module.exports = {
  userService: {
    getAllActivated,
    normalize,
    findByEmail,
    register,
  },
};
