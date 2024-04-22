const { ERRORS } = require('../const/errors');
const { ApiError } = require('../exceptions/api.error');
const { ValidatorHelper } = require('../helpers/validator');
const { UsersService } = require('../services/users.service');

const getUsers = async (req, res) => {
  const users = await UsersService.getAll();

  const normalizedUsers = users.map((user) => UsersService.normalize(user));

  res.status(200);
  res.send(normalizedUsers);
};

const getUserById = async (req, res) => {
  const { id } = req.params;

  const user = await UsersService.getById(id);

  if (!user) {
    res.status(404);

    res.send(ERRORS.USER_NOT_FOUND);
  }

  res.status(200);
  res.send(UsersService.normalize(user));
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    throw ApiError.badRequest(ERRORS.NAME_REQUIRED);
  }

  const user = await UsersService.getById(id);

  if (!user) {
    res.status(404);
    res.send(ERRORS.USER_NOT_FOUND);
  }

  await UsersService.update(id, name);

  const updatedUser = await UsersService.getById(id);

  res.status(200);
  res.send(UsersService.normalize(updatedUser));
};

const updatePassword = async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword, confirmation } = req.body;

  await UsersService.changePassword(id, oldPassword, newPassword, confirmation);

  res.sendStatus(200);
};

const updateEmail = async (req, res) => {
  const { id } = req.params;
  const { newEmail } = req.body;

  const user = await UsersService.getById(id);

  if (!user) {
    throw ApiError.unauthorized(ERRORS.USER_NOT_FOUND);
  }

  const errors = {
    newEmail: ValidatorHelper.validateEmail(newEmail),
  };

  if (errors.newEmail) {
    throw ApiError.badRequest(ERRORS.EMAIL_REQUIRED);
  }

  await UsersService.updateEmailRequest(user, newEmail);

  res.sendStatus(200);
};

const updateEmailConfirm = async (req, res) => {
  const { activationToken } = req.params;

  const user = await UsersService.getByQuery({ activationToken });

  if (!user) {
    throw ApiError.notFound();
  }

  await UsersService.updateEmailService(activationToken);

  res.status(204);
};

module.exports = {
  UsersController: {
    getUsers,
    getUserById,
    updateUser,
    updatePassword,
    updateEmail,
    updateEmailConfirm,
  },
};
