const bcrypt = require('bcrypt');
const nodeCrypto = require('crypto');
const { User } = require('../models/User');

const findByEmail = async (email) => {
  return User.findOne({
    where: { email },
  });
};

const findById = async (id) => {
  return User.findByPk(id);
};

const findByActivationToken = async (token) => {
  return User.findOne({
    where: { activationToken: token },
  });
};

const createUser = async ({ name, email, password }) => {
  const passwordHash = await bcrypt.hash(password, 10);
  const activationToken = nodeCrypto.randomUUID();

  return User.create({
    name,
    email,
    password: passwordHash,
    isActive: false,
    activationToken,
  });
};

const activateUser = async (user) => {
  user.isActive = true;
  user.activationToken = null;

  await user.save();

  return user;
};

const checkPassword = async (password, passwordHash) => {
  return bcrypt.compare(password, passwordHash);
};

const updateUserName = async (user, name) => {
  user.name = name;

  await user.save();

  return user;
};

const updatePassword = async (user, password) => {
  user.password = await bcrypt.hash(password, 10);

  await user.save();

  return user;
};

const createPasswordResetToken = async (user) => {
  const resetToken = nodeCrypto.randomUUID();

  user.resetToken = resetToken;

  await user.save();

  return resetToken;
};

const findByResetToken = async (token) => {
  return User.findOne({
    where: { resetToken: token },
  });
};

const resetPassword = async (user, password) => {
  user.password = await bcrypt.hash(password, 10);
  user.resetToken = null;

  await user.save();

  return user;
};

const createEmailChangeToken = async (user, newEmail) => {
  const emailChangeToken = nodeCrypto.randomUUID();

  user.newEmail = newEmail;
  user.emailChangeToken = emailChangeToken;

  await user.save();

  return emailChangeToken;
};

const findByEmailChangeToken = async (token) => {
  return User.findOne({
    where: {
      emailChangeToken: token,
    },
  });
};

const confirmEmailChange = async (user) => {
  const oldEmail = user.email;

  user.email = user.newEmail;
  user.newEmail = null;
  user.emailChangeToken = null;

  await user.save();

  return oldEmail;
};

module.exports = {
  findByEmail,
  findById,
  findByActivationToken,
  createUser,
  activateUser,
  checkPassword,
  updateUserName,
  updatePassword,
  createPasswordResetToken,
  findByResetToken,
  resetPassword,
  createEmailChangeToken,
  findByEmailChangeToken,
  confirmEmailChange,
};
