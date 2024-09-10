const { User } = require('../models/user.model.js');
// const { ApiError } = require('../exeptions/api.error.js');
const { UUIDV4 } = require('sequelize');
const emailsService = require('./emails.service.js');
const bcrypt = require('bcrypt');
const ApiError = require('../exeptions/api.error.js');

function normalize({ id, email, name }) {
  return { id, email, name };
}

const getAllActiveUsers = async () => {
  return User.findAll().map((user) => normalize(user));
};

const getOneBy = async ({ userId, email, activationToken }) => {
  const where = {};

  if (userId) {
    where.id = userId;
  }

  if (email) {
    where.email = email;
  }

  if (activationToken) {
    where.activationToken = activationToken;
  }

  const findedUser = User.findOne({ where });

  return normalize(findedUser);
};

const createUser = async (name, email, password) => {
  const activationToken = UUIDV4();

  const newUser = await User.create({
    name,
    email,
    password,
    activationToken,
  });

  await emailsService.sendEmail(
    email,
    activationToken,
    'activate',
    'Activate account',
    'Activate',
  );

  return normalize(newUser);
};

const updateUserName = async (userId, newName) => {
  const userToUpdate = await getOneBy(userId);

  userToUpdate.name = newName;
  await userToUpdate.save();

  return normalize(userToUpdate);
};

const updateUserEmail = async (userId, newEmail) => {
  const user = await getOneBy(userId);

  await emailsService.sendEmailChangeNotification(user.email, newEmail);

  user.email = newEmail;
  await user.save();
};

const updateUserPassword = async (userId, newPassword) => {
  const user = await getOneBy(userId);

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
};

const resetUserPassword = async (userId, newPassword) => {
  const user = await getOneBy(userId);

  if (!user) {
    throw ApiError.NotFound();
  }
  user.password = newPassword;
  await user.save();
};

module.exports = {
  normalize,
  getAllActiveUsers,
  getOneBy,
  createUser,
  updateUserName,
  updateUserEmail,
  updateUserPassword,
  resetUserPassword,
};
