const { ApiError } = require('../exeptions/api.error');
const { User } = require('../models/user');
const { emailService } = require('../services/email.service');
const { v4: uuidv4 } = require('uuid');

function normalize({ name, id, email }) {
  return { name, id, email };
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

async function register(name, email, password) {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
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
}

const updateResetToken = async (userId, resetToken) => {
  const user = await User.update({ resetToken }, { where: { id: userId } });

  return user;
};

const findByResetToken = async (resetToken) => {
  const user = await User.findOne({ where: { resetToken } });

  return user;
};

const updatePassword = async (userId, hashedPassword) => {
  const user = await User.update(
    { password: hashedPassword, resetToken: null },
    { where: { id: userId } },
  );

  return user;
};

module.exports = {
  normalize,
  findByEmail,
  register,
  updateResetToken,
  findByResetToken,
  updatePassword,
};
