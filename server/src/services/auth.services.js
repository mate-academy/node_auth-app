const User = require("../models/user");
const { v4 } = require("uuid");
const emailService = require("../services/email.services");
const ApiError = require("../exceptions/ApiError");

const getAll = () => User.findAll();

const getByEmail = (email) => User.findOne({ where: { email } });

const getByActivationToken = (activationToken) =>
  User.findOne({ where: { activationToken } });

const getByResetPasswordToken = (resetPasswordToken) =>
  User.findOne({ where: { resetPasswordToken } });

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

const verifyResetPasswordTokenInDB = async (resetPasswordToken) => {
  const user = await getByResetPasswordToken(resetPasswordToken);

  if (!user) {
    throw ApiError.BadRequest("The reset token is not valid");
  }

  return user;
};

module.exports = {
  getAll,
  getByEmail,
  getByActivationToken,
  getByResetPasswordToken,
  create,
  normalize,
  register,
  verifyResetPasswordTokenInDB,
};
