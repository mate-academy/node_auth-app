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

const normalize = ({ id, email }) => {
  return { id, email };
};

const findByEmail = (email) => {
  return User.findOne({ where: { email } });
};

const registerUser = async (email, password) => {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('user already exist', {
      email: 'user already exist',
    });
  }

  User.create({ email, password, activationToken });

  await sendActivationEmail(email, activationToken);
};

module.exports = {
  getAllActivatedUsers,
  normalize,
  findByEmail,
  registerUser,
};
