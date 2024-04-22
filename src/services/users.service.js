const { v4 } = require('uuid');

const { ApiError } = require('../exceptions/api.error');
const { User } = require('../models/User.model');
const { EmailService } = require('./email.service');
const { ERRORS } = require('../const/errors');
const { ValidatorHelper } = require('../helpers/validator');
const { createHash, compare } = require('../helpers/bcrypt');

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

async function resetPassword(activationToken, password) {
  const user = await getByQuery({ activationToken });

  if (!user) {
    throw ApiError.NotFound(ERRORS.USER_NOT_FOUND);
  }

  const hashedPassword = await createHash(password);

  user.activationToken = null;
  user.password = hashedPassword;
  await user.save();
}

async function changePassword(email, oldPassword, newPassword, confirmation) {
  const user = await getByQuery({ email });

  if (!user) {
    throw ApiError.NotFound('user');
  }

  const isValid = await compare(oldPassword, user.password);

  const errors = {
    oldPassword: isValid,
    newPassword: ValidatorHelper.validatePassword(newPassword),
    confirmation:
      newPassword !== confirmation ? ERRORS.PASSWORDS_DO_NOT_MATCH : null,
  };

  if (errors.oldPassword || errors.newPassword || errors.confirmation) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  user.password = await createHash(newPassword);

  await user.save();
}

async function updateEmailRequest(user, newEmail) {
  const activationToken = v4();

  user.activationToken = activationToken;
  user.email = newEmail;

  await user.save();
  await EmailService.sendNewEmailActivation(newEmail, activationToken);
}

async function updateEmailService(activationToken) {
  const user = await getByQuery({ activationToken });

  if (!user) {
    throw ApiError.NotFound(ERRORS.USER_NOT_FOUND);
  }

  user.activationToken = null;
  await user.save();
}

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
