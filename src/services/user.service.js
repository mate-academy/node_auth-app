import { v4 as uuidv4 } from 'uuid';
import errors from '../errors/index.error.js';
import models from '../models/index.model.js';
import utils from '../utils/index.utils.js';
import encryptService from './encrypt.service.js';
import services from './index.service.js';

const normalizeData = (data) =>
  utils.normalize(data, utils.CONFIDENTIAL_FIELDS);

const create = async (data) => {
  const password = encryptService.sync(data.password);
  const user = await models.user.create({ id: uuidv4(), ...data, password });

  return normalizeData(user.dataValues);
};

const find = async (data) => {
  const [key, value] = Object.entries(data)[0];
  const user = await models.user.findOne({ where: { [key]: value } });

  if (user === null) {
    throw errors.notFound('User not found');
  }

  return user;
};

const list = async (data) => {
  const totalUsers = await models.user.count();
  const { limit, offset, pages, prev, curr, next } = utils.pagination(
    data,
    totalUsers,
  );

  const users = await models.user.findAll({
    limit,
    offset,
    order: [['createdAt']],
  });
  const normalizedUsers = users.map((user) => normalizeData(user.dataValues));

  const listUsers = {
    size: totalUsers,
    pages,
    prev,
    curr,
    next,

    users: normalizedUsers,
  };

  return listUsers;
};

const updateInfo = async (id, data) => {
  if (data.id) {
    delete data.id;
  }

  if (data.email) {
    const updateEmail = await find({ id });

    if (!data.password) {
      throw errors.badRequest(
        'Needed to send current password to update email',
      );
    }

    const userPassword = services.encrypt.compare(
      data.password,
      updateEmail.dataValues.password,
    );

    if (!userPassword) {
      throw errors.badRequest(
        'Can not update email current password does not match',
      );
    }
  }

  if (data.password) {
    delete data.password;
  }

  if (!data.email && !data.name) {
    throw errors.badRequest('Provide a new email or name');
  }

  const user = await models.user.update(data, { where: { id } });

  return user;
};

const updatePassword = async (id, data) => {
  const user = await find({ id });
  const isOldPassword = services.encrypt.compare(
    data.oldPassword,
    user.password,
  );

  if (!isOldPassword) {
    throw errors.badRequest('Old password is not correct');
  }

  const password = services.encrypt.sync(data.newPassword);

  await models.user.update({ password }, { where: { id } });

  return normalizeData((await find({ id })).dataValues);
};

const remove = async (id) => {
  await models.auth.destroy({ where: { userId: id } });
  await models.user.destroy({ where: { id } });
};

const userService = {
  create,
  find,
  list,
  updateInfo,
  updatePassword,
  remove,
};

export default userService;
