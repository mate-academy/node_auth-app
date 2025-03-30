import errors from '../errors/index.error.js';
import models from '../models/index.model.js';
import encryptService from './encrypt.service.js';

const login = async (data) => {
  const user = await models.user.findOne({ where: { email: data.email } });

  if (!user) {
    throw errors.badRequest('Invalid credentials');
  }

  const validPassword = encryptService.compare(data.password, user.password);

  if (!validPassword) {
    throw errors.badRequest('Invalid credentials');
  }

  return user;
};

const logout = async (token) => {
  const auth = await models.auth.findOne({
    where: token,
  });

  if (!auth) {
    return;
  }

  await models.auth.update(
    {
      token: null,
      refresh: null,
    },
    { where: { id: auth.id } },
  );
};

const create = async (data) => {
  await models.auth.create({
    userId: data.userId,
    activate: data.activate,
  });
};

const activate = async (data) => {
  const token = await models.auth.findOne({ where: { activate: data.token } });

  if (!token) {
    throw errors.notFound('Token not found');
  }

  await models.auth.update(
    { activate: null },
    { where: { activate: data.token } },
  );
};

const authService = {
  create,
  activate,
  login,
  logout,
};

export default authService;
