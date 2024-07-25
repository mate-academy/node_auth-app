const { v4: uuidv4 } = require('uuid');
const { User } = require('../models/user.model.js');
const { sendActivationEmail } = require('./email.service.js');
const { ApiError } = require('../exceptions/api.error.js');

async function getUserById(id) {
  const user = await User.findOne({ where: { id } });

  return user;
}

async function getUser(userId) {
  const user = await getUserById(userId);

  if (!user) {
    throw ApiError.notFound({
      message: 'User not found',
    });
  }

  return normalize(user);
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

function normalize({ id, name, email }) {
  return { id, name, email };
}

async function register(name, email, password) {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exist', {
      email: 'User already exist',
    });
  }

  const user = await User.create({
    name,
    email,
    password,
    activationToken,
  });

  await sendActivationEmail(email, activationToken);

  return user;
}

module.exports = {
  getUserById,
  getUser,
  findByEmail,
  normalize,
  register,
};
