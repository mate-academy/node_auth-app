const { ApiError } = require('../exception/api.error');
const { User } = require('../model/user');
const { emailService } = require('./email.service');
const { v4: uuidv4 } = require('uuid');

const normalize = ({ id, userName, email }) => ({ id, userName, email });

const getUserById = async (id) => {
  const user = await User.findByPk(id);

  return user;
};

const findByEmail = (email) => User.findOne({ where: { email } });

const register = async (email, password, userName) => {
  const activationToken = uuidv4();
  const existUser = await User.findOne({ where: { email } });

  if (existUser) {
    throw ApiError.badRequest('User already exist', {
      email: 'User already exist',
    });
  }

  await User.create({
    email,
    password,
    userName,
    activationToken,
  });

  await emailService.sendActivationEmail(email, activationToken);
};

const reset = async (email) => {
  const resetToken = uuidv4();
  const resetTokenExpires = Date.now() + 15 * 60 * 1000;

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return;
  }

  if (user.resetTokenExpires && user.resetTokenExpires >= Date.now()) {
    return;
  }

  user.resetToken = resetToken;
  user.resetTokenExpires = resetTokenExpires;
  await user.save();

  await emailService.sendResetPassword(email, resetToken);
};

const resetPassword = async ({ resetToken, password }) => {
  const user = await User.findOne({ where: { resetToken } });

  if (!user) {
    throw ApiError.badRequest('Incorrect reset link');
  }

  if (!user.resetToken || Date.now() > +user.resetTokenExpires) {
    throw ApiError.badRequest('Reset link expired. Request a new one');
  }

  user.password = password;
  user.resetToken = null;
  user.resetTokenExpires = null;

  await user.save();
};

const userService = {
  getUserById,
  findByEmail,
  normalize,
  register,
  reset,
  resetPassword,
};

module.exports = { userService };
