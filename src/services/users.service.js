const { v4 } = require('uuid');

const { ApiError } = require('../exceptions/api.error');
const { User } = require('../models/User.model');
const { EmailService } = require('./email.service');
const { ERRORS } = require('../const/errors');
const { bcryptHelper } = require('../helpers/bcrypt');

const getAll = () => {
  return User.findAll({
    where: { activationToken: null },
    order: ['id'],
  });
};

const getById = (id) => {
  return User.findByPk(id);
};

const getByQuery = (query) => {
  return User.findOne({ where: query });
};

const create = async (email, password, name) => {
  const activationToken = v4();

  const existUser = await getByQuery({ email });

  if (existUser) {
    throw ApiError.badRequest(ERRORS.EMAIL_EXIST, {
      email: ERRORS.EMAIL_EXIST,
    });
  }

  const newUser = await User.create({
    name,
    email,
    password,
    activationToken,
  });

  await EmailService.sendActivationEmail(email, activationToken);

  return newUser;
};

const update = (id, name) => {
  return User.update({ name }, { where: { id } });
};

const forgotPassword = async (user) => {
  const activationToken = v4();

  user.activationToken = activationToken;
  await user.save();
  await EmailService.sendResetPasswordLink(user.email, activationToken);
};

const resetPassword = async (activationToken, password) => {
  const user = await getByQuery({ activationToken });

  if (!user) {
    throw ApiError.NotFound(ERRORS.USER_NOT_FOUND);
  }

  const hashedPassword = await bcryptHelper.createHash(password);

  user.activationToken = null;
  user.password = hashedPassword;
  await user.save();
};

const changePassword = async (email, newPassword) => {
  const user = await getByQuery({ email });

  if (!user) {
    throw ApiError.NotFound('user');
  }

  user.password = await bcryptHelper.createHash(newPassword);

  await user.save();
};

const updateEmailRequest = async (user, newEmail) => {
  const activationToken = v4();

  user.activationToken = activationToken;
  user.email = newEmail;

  await user.save();
  await EmailService.sendNewEmailActivation(newEmail, activationToken);
};

const updateEmailService = async (activationToken) => {
  const user = await getByQuery({ activationToken });

  if (!user) {
    throw ApiError.NotFound(ERRORS.USER_NOT_FOUND);
  }

  user.activationToken = null;
  await user.save();
};

const normalize = ({ id, email, name }) => {
  return {
    id,
    email,
    name,
  };
};

module.exports = {
  UsersService: {
    getAll,
    getById,
    getByQuery,
    create,
    update,
    normalize,
    forgotPassword,
    resetPassword,
    changePassword,
    updateEmailRequest,
    updateEmailService,
  },
};
