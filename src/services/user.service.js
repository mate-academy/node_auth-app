const { ApiError } = require('../exceptions/api.error');
const { User } = require('../models/user');

const { sendActivationEmail } = require('../services/email.service');
const { v4: uuidv4 } = require('uuid');

const getAllActivatedUsers = () => {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
};

const normalize = ({ id, email, name }) => {
  return { id, email, name };
};

const findByEmail = (email) => {
  return User.findOne({ where: { email } });
};

const findByEmailAndId = (userId, email) => {
  return User.findOne({ where: { id: userId, email } });
};

const findUserById = (userId) => {
  return User.findOne({ where: { id: userId } });
};

const registerUser = async (name, email, password) => {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('user already exist', {
      email: 'user already exist',
    });
  }

  await User.create({ name, email, password, activationToken });

  await sendActivationEmail(name, email, activationToken);
};

module.exports = {
  getAllActivatedUsers,
  normalize,
  findByEmail,
  registerUser,
  findUserById,
  findByEmailAndId,
};
