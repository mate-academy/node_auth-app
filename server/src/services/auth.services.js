const User = require("../models/user");
const { v4 } = require("uuid");
const emailService = require("../services/email.services");
const ApiError = require("../exceptions/ApiError");

const getAll = () => User.findAll();

const getByEmail = (email) => User.findOne({ where: { email } });

const getByActivationToken = (activationToken) =>
  User.findOne({ where: { activationToken } });

const create = ({ email, password, activationToken }) => {
  return User.create({ email, password, activationToken });
};

const normalize = ({ id, email }) => {
  return { id, email };
};

const register = async (email, password) => {
  const activationToken = v4();

  const existUser = await getByEmail(email);

  if (existUser) {
    throw ApiError.Conflict();
  }

  const newUser = await create({
    email,
    password,
    activationToken,
  });

  await emailService.sendActivationEmail(email, activationToken);
  return newUser;
};

module.exports = {
  getAll,
  getByEmail,
  getByActivationToken,
  create,
  normalize,
  register,
};
