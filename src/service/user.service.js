'use strict';

const { User } = require('../model/user.model');

const normalize = (user) => {
  const normalizedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  return normalizedUser;
};

const findUserByParam = (param) => {
  return User.findOne(param);
};

const updateUser = async (id, data) => {
  const foundUser = await User.findByPk(id);

  return foundUser.update(data);
};

module.exports = {
  normalize,
  findUserByParam,
  updateUser,
};
