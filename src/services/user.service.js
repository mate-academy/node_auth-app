const { v4: uuidv4 } = require('uuid');

const { ApiError } = require('../exeptions/api.error.js');
const { User } = require('../models/user.model.js');
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

  let existingUser;

  try {
    existingUser = await findByEmail(email);
  } catch (err) {
    throw ApiError.internal('Database error while checking user existence');
  }

  if (existingUser) {
    throw ApiError.badRequest('User already exists', {
      email: 'User with this email already exists',
    });
  }

  try {
    await User.create({
      name,
      email,
      password,
      activationToken,
    });
  } catch (err) {
    throw ApiError.internal('Database error while creating user');
  }

  try {
    await emailService.sendActivationEmail({ name, email, activationToken });
  } catch (err) {
    throw ApiError.internal(
      'User created, but failed to send activation email',
    );
  }
}

module.exports = {
  userService: {
    getAllActivated,
    normalize,
    findByEmail,
    register,
  },
};
