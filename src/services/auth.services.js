const { ApiError } = require('../exeptions/auth.error');
const { User } = require('../models/user');
const { hashPassword } = require('../utils/password/hashPassword');
const { randomUUID } = require('crypto');

const signUp = async ({ email, password }) => {
  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    email,
    password: hashedPassword,
    activationToken: randomUUID(),
  });

  return user;
};

const activate = async (activationToken) => {
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    throw ApiError.badRequest('Bad activation link');
  }

  user.activationToken = null;

  await user.save();
};

const resetPassword = async (resetToken, password) => {
  const user = await User.findOne({ where: { resetToken } });

  if (!user) {
    throw ApiError.badRequest('Bad reset password link');
  }

  const hashedPassword = await hashPassword(password);

  user.password = hashedPassword;
  user.resetToken = null;

  await user.save();
};

const getResetToken = async (user) => {
  const resetToken = randomUUID();

  user.resetToken = resetToken;

  await user.save();

  return resetToken;
};

module.exports = {
  authServices: {
    signUp,
    activate,
    getResetToken,
    resetPassword,
  },
};
