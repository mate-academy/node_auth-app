const User = require('../models/user.js');
const { v4: uuidv4 } = require('uuid');
const emailService = require('../services/emailService.js');
const ApiError = require('../exeptions/apiError.js');

const getAllActivated = () => {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
};

const findByEmail = (email) => {
  return User.findOne({ where: { email } });
};

const normalize = ({ id, email }) => {
  return { id, email };
};

const register = async (name, email, password) => {
  const activationToken = uuidv4();
  const existUser = await findByEmail(email);

  if (!existUser) {
    throw ApiError.badRequest('User already exist', {
      email: 'User already exist',
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

const updatePassword = async (id, newPassword) => {
  await User.update({ password: newPassword }, { where: { id } });
};

module.exports = {
  getAllActivated,
  normalize,
  findByEmail,
  register,
  updatePassword,
};
