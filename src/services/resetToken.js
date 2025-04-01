const { ResetToken } = require('../models/resetToken');
const moment = require('moment');
const { findByEmail } = require('./userService');
const { v4: uuidv4 } = require('uuid');
const { ApiError } = require('../exceptions/apiError');
const { sendResetEmail } = require('./mailService');

const findByUserId = (userId) => {
  return ResetToken.findOne({ where: { userId } });
};

const findUserByResetToken = (resetToken) => {
  return ResetToken.findOne({ where: { resetToken } });
};

const removeResetToken = (resetToken) => {
  return ResetToken.destroy({ where: { resetToken } });
};

const save = async (userId, newToken) => {
  const token = await findByUserId(userId);

  const currentTime = moment();
  const expirationTime = moment().add(60, 'minutes');

  if (!token) {
    await ResetToken.create({
      userId,
      resetToken: newToken,
      expirationTime: expirationTime.format('YYYY-MM-DD HH:mm:ss'),
    });

    return;
  }

  if (currentTime.isAfter(token.expirationTime)) {
    token.resetToken = newToken;
    token.expirationTime = expirationTime.format('YYYY-MM-DD HH:mm:ss');
    await token.save();
  }
};

const resetPasswordUser = async (email) => {
  const user = await findByEmail(email);
  const resetToken = uuidv4();

  if (!user) {
    throw ApiError.badRequest('Email is not found, please sign up!');
  }

  await save(user.id, resetToken);

  const { name } = user;
  const { resetToken: refreshToken } = await findByUserId(user.id);

  await sendResetEmail(name, email, refreshToken);
};

module.exports = {
  save,
  findByUserId,
  resetPasswordUser,
  removeResetToken,
  findUserByResetToken,
};
