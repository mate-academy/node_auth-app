const bcrypt = require('bcrypt');

const { ApiError } = require('../exceptions/api.error');
const { User } = require('../models/User');
const emailService = require('../services/email.service');
const { hashPassword } = require('../utils');

const normalize = ({ id, name, email }) => {
  return { id, name, email };
};

const getAllActive = () => {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
};

const findByEmail = (email) => {
  return User.findOne({ where: { email } });
};

const findByToken = (activationToken) => {
  return User.findOne({ where: { activationToken } });
};

const findById = (id) => {
  return User.findOne({ where: { id } });
};

const create = async (name, email, password) => {
  const existingUser = await findByEmail(email);

  if (existingUser) {
    throw ApiError.BadRequest('User already exist', {
      email: 'User already exist',
    });
  }

  const hash = await hashPassword(password);
  const activationToken = bcrypt.genSaltSync(1);

  await User.create({
    name,
    email,
    password: hash,
    activationToken,
  });

  await emailService.sendActivationLink(name, email, activationToken);
};

const update = async (data, userId) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.NotFound();
  }

  if (data.password) {
    data.password = await hashPassword(data.password);
  }

  await user.update(data);

  return user;
};

module.exports = {
  normalize,
  getAllActive,
  findByEmail,
  findById,
  findByToken,
  create,
  update,
};
