const { ApiError } = require('../exeptions/apiError');
const { User } = require('../models/user.model');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const emailService = require('../services/email.service.js');

const normalize = ({ id, name, email }) => {
  return { id, name, email };
};

const findByEmail = async (email) => {
  const user = await User.findOne({ where: { email } });

  return user;
};

const create = async ({ name, email, password }) => {
  const isExist = await findByEmail(email);

  if (isExist) {
    throw ApiError.badRequest('Validation error', {
      email: 'Email is already taken',
    });
  }

  const activationToken = uuidv4();
  const hash = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hash,
    activation_token: activationToken,
  });

  await emailService.sendActivationLink(email, activationToken);

  return normalize(newUser);
};

const changePassword = async ({ password, userId }) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.notFound();
  }

  const hash = await bcrypt.hash(password, 7);

  user.password = hash;
  await user.save();
};

module.exports = {
  create,
  findByEmail,
  normalize,
  changePassword,
};
