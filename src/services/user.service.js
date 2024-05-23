const { User } = require('../models/user.model.js');
const { v4: uuidv4 } = require('uuid');
const emailService = require('./email.service.js');
const { ApiError } = require('../exeptions/api.error.js');

const normalize = ({ id, email, name }) => {
  return { id, email, name };
};

const findById = (id) => {
  return User.findOne({
    where: { id },
  });
};

const findByToken = (activationToken) => {
  return User.findOne({
    where: { activationToken },
  });
};

const getAllActivated = () => {
  return User.findAll({
    where: { activationToken: null },
  });
};

const findByEmail = (email) => {
  return User.findOne({
    where: { email },
  });
};

const register = async (email, password) => {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.BadRequest('User already exists', {
      email: 'User already exists',
    });
  }

  await User.create({ email, password, activationToken });

  await emailService.sendActinvationEmail(email, activationToken);
};

const requestPasswordReset = async (email, resetPasswordToken) => {
  await emailService.sendPasswordResetEmail(email, resetPasswordToken);
};

const resetPassword = async (hashedPassword, id) => {
  if (!hashedPassword) {
    throw ApiError.BadRequest('Password is required');
  }

  await User.update({ password: hashedPassword }, { where: { id } });
};

const updateName = async (name, id) => {
  await User.update({ name }, { where: { id } });
};

const changeEmail = async (newEmail, user) => {
  const activationToken = uuidv4();

  await User.update(
    { email: newEmail, activationToken },
    { where: { id: user.id } },
  );

  await emailService.sendNotificationEmail(user.email, newEmail);
  await emailService.sendActinvationEmail(newEmail, activationToken);
};

module.exports = {
  findById,
  findByToken,
  getAllActivated,
  findByEmail,
  normalize,
  register,
  requestPasswordReset,
  resetPassword,
  updateName,
  changeEmail,
};
