const { ApiError } = require('../exceptions/apiError');
const { User } = require('../models/user');
const { v4: uuidv4 } = require('uuid');
const { sendActivationEmail } = require('./mailService');

const findByEmail = (email) => {
  return User.findOne({ where: { email } });
};

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

const findByEmailAndId = (userId, email) => {
  return User.findOne({ where: { id: userId, email } });
};

const findUserById = (userId) => {
  return User.findOne({ where: { id: userId } });
};

const registerUser = async (name, email, password) => {
  try {
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

    await sendActivationEmail(name, email, activationToken);
  } catch (error) {
    throw ApiError.internal('Ошибка на сервере', error);
  }
};

module.exports = {
  getAllActivatedUsers,
  normalize,
  findByEmail,
  registerUser,
  findUserById,
  findByEmailAndId,
};
