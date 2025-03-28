'use strict';

const { User } = require('../storage/models/User.model');

const normalize = ({
  id,
  username,
  email,
}) => ({
  id,
  username,
  email,
});

const getAll = async() => {
  const users = await User.findAll({
    order: [ 'createdAt' ],
  });

  return users;
};

const getOneByField = async(field) => {
  const user = await User.findOne({
    where: field,
  });

  return user;
};

const getById = async(id) => {
  const user = await User.findByPk(id);

  return user;
};

const create = async(userData) => {
  const newUser = await User.create(userData);

  return newUser;
};

const patchById = async(id, patchData) => {
  const foundUser = await User.findByPk(id);

  if (!foundUser) {
    return null;
  }

  const patchedUser = await User.update(patchData, {
    where: { id },
  });

  return patchedUser;
};

const removeById = async(id) => {
  const deleted = await User.destroy({
    where: { id },
  });

  return deleted;
};

module.exports = {
  normalize,
  getAll,
  getOneByField,
  getById,
  create,
  patchById,
  removeById,
};
